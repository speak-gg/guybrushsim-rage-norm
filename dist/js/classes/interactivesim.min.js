const INTERACTIVE_SPELLS = ['Bloodthirst', 'MortalStrike', 'Whirlwind', 'Slam', 'Execute', 'Overpower', 'HeroicStrike', 'Cleave', 'Hamstring', 'SunderArmor', 'ThunderClap', 'Rend', 'ShieldSlam'];
const INTERACTIVE_QUEUE_WINDOW = 400;
// Never used in Play Fight, even if ticked in the rotation
const INTERACTIVE_EXCLUDED = ['BerserkerRage', 'JujuFlurry'];

// RAGE NORM build 18: ported from WarriorSim-classic's Play Fight and adapted to this fork's rage tracking.
// Real-time, user-driven version of Simulation.run(): same event mechanics, but the
// rotation priority list is replaced by the ability the user pressed.
class InteractiveSimulation extends Simulation {

    // Builds a Player from the current page config with every legal rotation ability available,
    // and with the user's rotation rules (min rage, HS unqueue, ...) removed so only game rules apply.
    // With manualCooldowns, the rest of the rotation panel's Buffs section is also made available for manual use.
    // Battle Shout is always present (kept up for the whole fight in start()).
    static createPlayer(options = {}) {
        const legal = new Set($('.rotation .spell').map((i, el) => String($(el).data('id'))).get());
        const cooldownIds = new Set(!options.manualCooldowns ? [] : spells
            .filter(s => s.buff && legal.has(String(s.id)) && s.classname !== 'BattleShout' && !INTERACTIVE_EXCLUDED.includes(s.classname))
            .map(s => String(s.id)));
        const saved = spells.map(s => s.active);
        let player;
        try {
            for (let s of spells) {
                const isLegal = legal.has(String(s.id));
                if (INTERACTIVE_SPELLS.includes(s.classname) && isLegal) s.active = true;
                if (s.classname === 'BattleShout' && isLegal) s.active = true;
                if (cooldownIds.has(String(s.id))) s.active = true;
                if (INTERACTIVE_EXCLUDED.includes(s.classname)) s.active = false;
            }
            player = new Player(undefined, undefined, undefined, { ...Player.getConfig(), logging: true });
        }
        finally {
            spells.forEach((s, i) => s.active = saved[i]);
        }
        if (!player.mh) return player;

        player.cooldownspells = [];
        for (let s of spells) {
            if (!cooldownIds.has(String(s.id))) continue;
            const key = s.classname.toLowerCase();
            const cooldown = s.aura ? player.auras[key] : player.spells[key];
            if (!cooldown || player.cooldownspells.includes(cooldown)) continue;
            for (let rule of ['maxrage', 'zerkerpriority', 'timetoend', 'timetostart'])
                delete cooldown[rule];
            player.cooldownspells.push(cooldown);
        }

        player.manualspells = [];
        for (let name of INTERACTIVE_SPELLS) {
            const key = name.toLowerCase();
            const spell = player.spells[key] || player.auras[key];
            if (!spell) continue;
            spell.minrage = 0;
            for (let rule of ['maxrage', 'maincd', 'swingtimer', 'unqueue', 'globals', 'exmacro', 'priority', 'expriority'])
                delete spell[rule];
            player.manualspells.push(spell);
        }
        player.normalspells = [];
        player.executespells = [];
        player.normalspells_c = 0;
        player.executespells_c = 0;
        return player;
    }

    constructor(player, config) {
        super(player, null, null, config);
    }

    start() {
        step = 0;
        this.idmg = 0;
        const player = this.player;
        player.reset(this.startrage);
        this.maxsteps = rng(this.timesecsmin * 1000, this.timesecsmax * 1000);
        this.duration = this.maxsteps / 1000;
        this.executestep = this.maxsteps - parseInt(this.maxsteps * (this.executeperc / 100));
        if (player.spells.execute) player.spells.execute.executestep = this.executestep;
        this.delayedspell = null;
        this.spellcheck = false;
        this.canSpellQueue = false;
        this.next = 0;
        this.slamstep = 0;
        this.slamspell = null;
        this.pending = null;
        this.queue = [];
        this.manualset = new Set(player.cooldownspells);
        this.done = false;
        this.needProcess = true;
        this.eventStep = 0;
        this.lastBossStep = -1;

        let itemdelay = 0;
        for (let spell of player.preporder) {
            if (spell.aura)
                itemdelay += player.auras[spell.classname.toLowerCase()].prep(this.maxsteps, itemdelay);
            else if (player.spells[spell.classname.toLowerCase()].prep)
                player.spells[spell.classname.toLowerCase()].prep(this.maxsteps);
        }
        // Manual cooldowns are usable from the pull; no pre-pull use either
        for (let cooldown of player.cooldownspells) cooldown.usestep = 0;

        let prepull = [];
        for (let aura of Object.values(player.auras)) {
            if (aura.usestep < 0) prepull.push(aura);
        }
        prepull.sort((a, b) => (b.usestep - a.usestep));
        let counter = 1500;
        for (let aura of prepull) {
            if (aura.canUse()) {
                aura.use(false, counter);
                counter += 1500;
                player.timer = 0;
                player.itemtimer = 0;
            }
        }
        if (player.auras.battleshout) {
            player.auras.battleshout.use(true);
            player.auras.battleshout.timer = this.maxsteps + 1;
        }
        player.timer = 0;
    }

    // Runs the fight forward to targetStep (ms), processing every event on the way.
    advance(targetStep) {
        const end = Math.min(targetStep, this.maxsteps);
        while (!this.done) {
            if (step >= this.maxsteps) {
                this.finish();
                return;
            }
            if (this.needProcess) {
                this.needProcess = false;
                const next = this.process();
                if (next === 0) {
                    this.next = 0;
                    this.needProcess = true;
                    continue;
                }
                this.eventStep = step + next;
            }
            if (step >= end) return;

            const next = Math.min(this.eventStep, end) - step;
            this.next = next;
            step += next;
            this.stepTimers(next);
            this.needProcess = true;
        }
    }

    // Returns { ok } or { ok: false, reason }. HS/Cleave queue onto the next swing; pressing again keeps it queued.
    press(spell) {
        if (this.done) return { ok: false, reason: 'Fight is over' };
        const player = this.player;
        if (spell instanceof HeroicStrike || spell instanceof Cleave) {
            if (player.nextswinghs) return { ok: true, queued: true };
            if (!spell.canUse()) return { ok: false, reason: this.reason(spell) };
            player.cast(spell);
            return { ok: true, queued: true };
        }
        if (spell.canUse()) {
            if (!this.queue.includes(spell)) this.queue.push(spell);
            this.eventStep = Math.min(this.eventStep, step + 1);
            return { ok: true };
        }
        if (this.queueable(spell)) {
            this.pending = spell;
            return { ok: true };
        }
        return { ok: false, reason: this.reason(spell) };
    }

    // True if the spell would be usable once the GCD / its own cooldown (<= queue window) runs out.
    queueable(spell) {
        const player = this.player;
        const isAura = spell instanceof Aura;
        const wait = Math.max(player.timer, isAura ? 0 : spell.timer);
        if (!wait || wait > INTERACTIVE_QUEUE_WINDOW) return false;
        const gcd = player.timer, cd = spell.timer;
        player.timer = 0;
        if (!isAura) spell.timer = 0;
        const ok = spell.canUse();
        player.timer = gcd;
        spell.timer = cd;
        return ok;
    }

    // Execute keeps a 1 ms timer after every use; it is only a real cooldown when the "Execute cooldown" setting is above 0.
    static executeOnCooldown(spell) {
        return !!(spell.player.variants && spell.player.variants.execd && spell.timer);
    }

    reason(spell) {
        const player = this.player;
        const name = (spells.find(s => s.id == spell.id) || {}).name || spell.name;
        if (spell instanceof Aura) {
            if (spell.timer) return `${name} is already active`;
            if (spell.firstuse === false && (spell instanceof MightyRagePotion || spell instanceof BloodFury || spell instanceof Berserking))
                return `${name} was already used this fight`;
            if (spell.usestep > step) return `${name} is on cooldown`;
        }
        else if (spell.timer && !(spell instanceof Execute)) return `${name} is on cooldown`;
        else if (spell instanceof Execute && InteractiveSimulation.executeOnCooldown(spell)) return `${name} is on cooldown`;
        if (player.timer && !(spell instanceof HeroicStrike || spell instanceof Cleave)) return 'Global cooldown';
        if (spell instanceof Execute && step < this.executestep) return 'Target is not in execute range';
        if (spell instanceof Overpower && !player.dodgetimer) return 'Overpower needs a dodge first';
        if (spell instanceof ShieldSlam && !player.shield) return 'Requires a shield';
        if ((spell.cost || 0) > player.rage) return 'Not enough rage';
        if (spell instanceof DeathWish && player.rage < 10) return 'Not enough rage';
        if (spell instanceof Berserking && player.rage < 5) return 'Not enough rage';
        return spell instanceof Aura ? 'Not usable right now' : 'Wrong stance';
    }

    // The batch sim's automatic-use priority, skipping anything the user controls manually.
    pickAuto() {
        const player = this.player, a = player.auras, s = player.spells;
        const usable = (x) => x && !this.manualset.has(x) && x.canUse();
        for (let x of [a.swarmguard, a.mightyragepotion, s.ragepotion, s.fireball, s.gunaxe, a.jujuflurry, s.grilekfury])
            if (usable(x)) return x;
        if (!player.timer && s.berserkerrage && s.berserkerrage.zerkerpriority && usable(s.berserkerrage)) return s.berserkerrage;
        for (let x of [s.bloodrage, a.cloudkeeper, a.voidmadness, a.gyromaticacceleration, a.gneurological, a.coinflip, a.pummeler, a.slayer,
            a.spider, a.gabbar, a.earthstrike, a.roarguardian, a.zandalarian, a.relentlessstrength, a.demontaintedblood, a.wrathwray, a.moonstalkerfury, a.grilekguard])
            if (usable(x)) return x;
        if (usable(s.stanceswitch)) return s.stanceswitch;
        if (player.timer) return null;
        for (let x of [a.flask, a.recklessness, a.deathwish, a.bloodfury, a.berserking, s.berserkerrage, a.battleshout])
            if (usable(x)) return x;
        return null;
    }

    // Damage so far this fight, including DoT/proc damage the batch sim only tallies at the end.
    currentDamage() {
        const player = this.player;
        let dmg = this.idmg;
        for (let key of ['deepwounds', 'deepwounds2', 'deepwounds3', 'deepwounds4', 'rend', 'weaponbleedmh', 'weaponbleedoh'])
            if (player.auras[key]) dmg += player.auras[key].idmg;
        for (let key of ['fireball', 'gunaxe', 'themoltencore'])
            if (player.spells[key]) dmg += player.spells[key].idmg;
        return dmg;
    }

    finish() {
        if (this.done) return;
        this.done = true;
        this.player.endauras();
        const damage = this.currentDamage();
        this.result = { damage, duration: this.duration, dps: damage / this.duration };
    }

    castNow(spell) {
        const player = this.player;
        if (spell instanceof Slam) {
            this.slamstep = step + spell.casttime;
            if (player.freeslam) this.slamstep = step;
            this.slamspell = spell;
            player.timer = 1500;
            player.heroicdelay = 0;
            player.nextswinghs = false;
            return;
        }
        let done = player.cast(spell);
        this.idmg += done;
        if (spell.offhandhit && player.oh) {
            done = player.castoh(spell);
            this.idmg += done;
        }
        if (spell instanceof Whirlwind || spell instanceof ThunderClap) {
            for (let i = 0; i < player.adjacent; i++) {
                done = player.cast(spell, undefined, player.adjacent, done);
                this.idmg += done;
                if (spell.offhandhit && player.oh) {
                    done = player.castoh(spell, player.adjacent, done);
                    this.idmg += done;
                }
            }
        }
    }

    // One pass of the Simulation.run() loop body at the current step. Returns ms until the next event (0 = run again now).
    process() {
        const player = this.player;

        // RAGE NORM: rage gains go through gainRage() so the rage formula, cap and rage tracking match the batch sim
        if (this.next != 0 && step % 3000 == 0 && player.talents.angermanagement) {
            player.gainRage(1, 'Anger Management', '1 per 3 sec');
            this.spellcheck = true;
            if (player.auras.consumedrage && player.rage >= 60 && player.rage < 81)
                player.auras.consumedrage.use();
        }
        if (player.vaelbuff && this.next != 0 && step % 1000 == 0) {
            player.gainRage(player.rage >= 60 ? Math.max(20, 100 - player.rage) : 20, 'Essence of the Red (Vaelastrasz)');
            this.spellcheck = true;
            if (player.auras.consumedrage && player.rage >= 60)
                player.auras.consumedrage.use();
        }
        if (player.spells.themoltencore && this.next != 0 && step % 2000 == 0) {
            player.spells.themoltencore.use();
        }
        if (player.target.speed && step % player.target.speed == 0 && step != this.lastBossStep) {
            this.lastBossStep = step;
            let oldRage = player.rage;
            let dmg = rng(player.target.mindmg, player.target.maxdmg);
            let gained = dmg / player.rageconversion * 2.5;
            player.gainRage(gained, 'Damage Taken', 'Boss melee hits');
            this.spellcheck = true;
            if (player.auras.consumedrage && player.rage >= 60 && oldRage < 60)
                player.auras.consumedrage.use();
            /* start-log */ if (player.logging) player.log(`Target attack for ${dmg} gained ${gained.toFixed(2)} rage `); /* end-log */
        }

        if (!this.slamstep) {
            if (player.mh.timer <= 0) {
                this.idmg += player.attackmh(player.mh);
                player.wfswing = false;
                this.spellcheck = true;
            }
            if (player.oh && player.oh.timer <= 0) {
                this.idmg += player.attackoh(player.oh);
                this.spellcheck = true;
            }

            // User presses: usable ones fire now in press order; GCD-blocked ones may wait in the queue window
            if (this.queue.length || this.pending) {
                const presses = this.queue.splice(0);
                if (this.pending && !presses.includes(this.pending)) presses.push(this.pending);
                this.pending = null;
                for (let i = 0; i < presses.length; i++) {
                    const spell = presses[i];
                    if (spell.canUse()) {
                        this.castNow(spell);
                        this.spellcheck = true;
                        if (this.slamstep) {
                            this.queue = presses.slice(i + 1);
                            return 0;
                        }
                    }
                    else if (this.queueable(spell)) this.pending = spell;
                    else if (this.onreject) this.onreject(spell, this.reason(spell));
                }
            }

            if (this.spellcheck && !player.spelldelay) {
                const auto = this.pickAuto();
                if (auto) {
                    player.spelldelay = 1;
                    this.delayedspell = auto;
                }
            }
            this.spellcheck = false;

            // Automatic uses still wait a human reaction time, like the batch sim
            const delayed = this.delayedspell;
            if (player.spelldelay && delayed && (this.canSpellQueue || player.spelldelay > delayed.maxdelay)) {
                player.spelldelay = 0;
                if (delayed.canUse()) {
                    let done = player.cast(delayed);
                    this.idmg += done;
                    if (delayed.offhandhit && player.oh) this.idmg += player.castoh(delayed);
                    this.spellcheck = true;
                }
            }
        }

        if (this.slamstep && step == this.slamstep) {
            const slam = this.slamspell;
            let done = player.cast(slam);
            this.idmg += done;
            if (slam.offhandhit && player.oh) this.idmg += player.castoh(slam);
            this.spellcheck = true;
            this.slamstep = 0;
            this.slamspell = null;
        }

        if (player.extraattacks > 0) {
            player.mh.timer = 0;
            player.extraattacks--;
            // RAGE NORM: flag the extra swing as a Windfury swing (Curved rage scales Windfury rage)
            if (player.pendingwf > 0) { player.pendingwf--; player.wfswing = true; }
        }
        if (player.batchedextras > 0) {
            player.mh.timer = batching - (step % batching);
            player.batchedextras--;
        }

        let next;
        if (!this.slamstep) {
            if (!player.mh.timer || this.spellcheck) return 0;
            next = Math.min(player.mh.timer, player.oh ? player.oh.timer : 9999);
            const delayed = this.delayedspell;
            if (player.spelldelay && (delayed.maxdelay - player.spelldelay) < next) next = delayed.maxdelay - player.spelldelay + 1;
        }
        else {
            next = this.slamstep - step;
        }

        if (player.timer && player.timer < next) next = player.timer;
        if (player.itemtimer && player.itemtimer < next) next = player.itemtimer;
        if (player.stancetimer && player.stancetimer < next) next = player.stancetimer;
        if (player.ragetimer && player.ragetimer < next) next = player.ragetimer;
        if (this.pending && !(this.pending instanceof Aura) && this.pending.timer && this.pending.timer < next) next = this.pending.timer;

        if (player.target.speed && (player.target.speed - (step % player.target.speed)) < next) next = player.target.speed - (step % player.target.speed);
        if (player.talents.angermanagement && (3000 - (step % 3000)) < next) next = 3000 - (step % 3000);
        if (player.vaelbuff && (1000 - (step % 1000)) < next) next = 1000 - (step % 1000);
        if (player.spells.themoltencore && (2000 - (step % 2000)) < next) next = 2000 - (step % 2000);
        if (player.auras.bloodrage && player.auras.bloodrage.timer && (1000 - ((step - player.auras.bloodrage.starttimer) % 1000)) < next)
            next = 1000 - ((step - player.auras.bloodrage.starttimer) % 1000);
        if (player.auras.gabbar && player.auras.gabbar.timer && (2000 - ((step - player.auras.gabbar.starttimer) % 2000)) < next)
            next = 2000 - ((step - player.auras.gabbar.starttimer) % 2000);
        if (player.auras.rend && player.auras.rend.timer && (3000 - ((step - player.auras.rend.starttimer) % 3000)) < next)
            next = 3000 - ((step - player.auras.rend.starttimer) % 3000);

        for (let key of ['deepwounds', 'deepwounds2', 'deepwounds3', 'deepwounds4']) {
            const dw = player.auras[key];
            if (dw && dw.timer && (dw.nexttick - step) < next) next = dw.nexttick - step;
        }
        for (let key of ['weaponbleedmh', 'weaponbleedoh']) {
            const bleed = player.auras[key];
            if (bleed && bleed.timer && (bleed.interval - ((step - bleed.starttimer) % bleed.interval)) < next)
                next = bleed.interval - ((step - bleed.starttimer) % bleed.interval);
        }

        for (let key of ['bloodthirst', 'mortalstrike', 'shieldslam', 'whirlwind', 'bloodrage', 'ragepotion', 'overpower', 'execute', 'slam']) {
            const spell = player.spells[key];
            if (spell && spell.timer && spell.timer < next) next = spell.timer;
        }

        return next;
    }

    // Timer bookkeeping from the second half of the Simulation.run() loop.
    stepTimers(next) {
        const player = this.player;
        player.mh.step(next);
        if (player.oh) player.oh.step(next);

        this.canSpellQueue = false;
        if (player.timer && player.steptimer(next) && !player.spelldelay) { this.spellcheck = true; this.canSpellQueue = player.spellqueueing; }
        if (player.itemtimer && player.stepitemtimer(next) && !player.spelldelay) this.spellcheck = true;
        if (player.stancetimer && player.stepstancetimer(next) && !player.spelldelay) this.spellcheck = true;
        if (player.ragetimer) player.stepragetimer(next);
        if (player.dodgetimer) player.stepdodgetimer(next);
        if (player.spelldelay) player.spelldelay += next;

        for (let key of ['berserkerrage', 'bloodthirst', 'mortalstrike', 'shieldslam', 'whirlwind', 'bloodrage', 'ragepotion', 'overpower', 'execute', 'hamstring', 'thunderclap', 'sunderarmor', 'slam']) {
            const spell = player.spells[key];
            if (spell && spell.timer && !spell.step(next) && !player.spelldelay) this.spellcheck = true;
        }

        if (player.auras.bloodrage && player.auras.bloodrage.timer && !player.auras.bloodrage.step() && !player.spelldelay) this.spellcheck = true;
        if (player.auras.gabbar && player.auras.gabbar.timer) player.auras.gabbar.step();
        for (let key of ['rend', 'deepwounds', 'weaponbleedmh', 'weaponbleedoh']) {
            const aura = player.auras[key];
            if (aura && aura.timer && !aura.step() && !player.spelldelay) this.spellcheck = true;
        }
        if (player.adjacent) {
            for (let key of ['deepwounds2', 'deepwounds3', 'deepwounds4']) {
                const aura = player.auras[key];
                if (aura && aura.timer && !aura.step() && !player.spelldelay) this.spellcheck = true;
            }
        }
    }
}
