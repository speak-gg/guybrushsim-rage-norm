class Player {
    static getConfig(base) {
        // Forever tab (mode "forever"): fixed WoW: Forever rules; only a few inputs are exposed.
        const isF = globalThis.mode === 'forever';
        const num = (n, d) => (v => isNaN(v) ? d : v)(parseFloat($('[name="' + n + '"]').val()));
        const rf = isF ? 'F2' : $('select[name="ragenorm"]').val();
        // RAGE NORM build 19: "PROPOSAL (LOCKED SETTINGS)" uses fixed values for everything from Bloodthirst AP coeff
        // to RN M_ref off hand, whatever the inputs say (Curved + Modified Classic rage coefficient underneath).
        if (!isF && rf == 'PROP') return Object.assign(Player.getConfigBase(), Player.PROPOSAL_CONFIG());
        return Player.getConfigBase(rf, isF, num);
    }
    static PROPOSAL_CONFIG() {
        return {
            proposal: true,
            variants: { btap: 0.40, btflat: 0, wwoh: 1, wwcost: 22, flurryhaste: 25, flurrycharges: 3, dwdmg: 15, dwdur: 30, execd: 4 },
            uw: { pct: 60, mech: 'forever' },
            fphit: 10,
            dwmech: 'forever', rmauto: 'forever', rmhs: 'forever', hsmech: 'forever',
            custom: { hit: 0, crit: 0, dodgered: 0 },
            ragenorm: { on: true, modc: true, coef: 9, k: 120, cap: 11, p: 1, oh: 0.625, wf: 0.75, tablecap: false, mrefmh: 1.266, mrefoh: 1.398 },
            forever: null,
        };
    }
    static getConfigBase(rf, isF, num) {
        if (isF === undefined) isF = globalThis.mode === 'forever';
        if (num === undefined) num = (n, d) => (v => isNaN(v) ? d : v)(parseFloat($('[name="' + n + '"]').val()));
        if (rf === undefined) rf = isF ? 'F2' : $('select[name="ragenorm"]').val();
        return {
            level: $('input[name="level"]').val(),
            race: $('select[name="race"]').val(),
            aqbooks: $('select[name="aqbooks"]').val() == "Yes",
            reactionmin: parseInt($('input[name="reactionmin"]').val()),
            reactionmax: parseInt($('input[name="reactionmax"]').val()),
            adjacent: parseInt($('input[name="adjacent"]').val()),
            mode: globalThis.mode,
            spellqueueing: $('select[name="spellqueueing"]').val() == "Yes",
            variants: isF ? {
                btap: 0.45, btflat: 0, wwoh: 1, wwcost: num('varwwcost', 22),
                flurryhaste: 25, flurrycharges: 3, dwdmg: 20, dwdur: 30, execd: 0,
            } : {
                btap: num('varbtap', 0.45),
                btflat: num('varbtflat', 0),
                wwoh: $('[name="varwwoh"]').val() == '1' ? 1 : 0,
                wwcost: num('varwwcost', 25),
                flurryhaste: parseFloat($('input[name="varflurryhaste"]').val()) || 0,
                flurrycharges: parseInt($('input[name="varflurrycharges"]').val()) || 3,
                dwdmg: num('vardwdmg', 20),
                dwdur: parseFloat($('input[name="vardwdur"]').val()) || 30,
                execd: parseFloat($('input[name="varexecd"]').val()) || 0,
            },
            // Unbridled Wrath: proc % at 5/5 (Classic 40, Forever 60) and mechanics (Classic: white + Heroic Strike/Cleave; Forever: white swings only)
            uw: isF ? { pct: 60, mech: 'forever' } : { pct: num('uwpct', 40), mech: $('select[name="uwmech"]').val() == 'forever' ? 'forever' : 'classic' },
            // Furious Precision (Forever Fury talent): flat off-hand hit %
            fphit: num('fphit', isF ? 10 : 0),
            dwmech: isF ? 'forever' : ($('select[name="dwmech"]').val() == 'forever' ? 'forever' : 'classic'),
            rmauto: isF ? 'forever' : ($('select[name="rmauto"]').val() == 'forever' ? 'forever' : 'classic'),
            rmhs: isF ? 'forever' : ($('select[name="rmhs"]').val() == 'forever' ? 'forever' : 'classic'),
            // Heroic Strike mechanics. Classic: a queued Heroic Strike/Cleave removes the dual wield miss penalty from off hand swings. Forever: it doesn't.
            hsmech: isF ? 'forever' : ($('select[name="hsmech"]').val() == 'forever' ? 'forever' : 'classic'),
            custom: {
                hit: parseFloat($('input[name="custombonushit"]').val()) || 0,
                crit: parseFloat($('input[name="custombonuscrit"]').val()) || 0,
                dodgered: parseFloat($('input[name="customdodgered"]').val()) || 0,
            },
            ragenorm: {
                on: rf == "On" || rf == "OnC",
                modc: rf == "OnC",
                coef: num('ragenormcoef', 7.5),
                k: parseFloat($('input[name="ragenormk"]').val()) || 171,
                cap: parseFloat($('input[name="ragenormcap"]').val()) || 13,
                p: parseFloat($('input[name="ragenormp"]').val()) || 3,
                oh: parseFloat($('input[name="ragenormoh"]').val()) || 0.625,
                wf: (v => isNaN(v) ? 0.75 : v)(parseFloat($('input[name="ragenormwf"]').val())),
                tablecap: $('select[name="ragenormtable"]').val() == "On",
                mrefmh: parseFloat($('input[name="ragenormmrefmh"]').val()) || 1.266,
                mrefoh: parseFloat($('input[name="ragenormmrefoh"]').val()) || 1.398,
            },
            // FOREVER rage (v2): rate x weapon speed per landed white swing (Marrow's compendium)
            forever: rf == 'F2' ? { ver: 2 } : null,
            target: {
                level: parseInt($('input[name="targetlevel"]').val()),
                basearmor: parseInt($('select[name="targetbasearmor"]').val() || $('input[name="targetcustomarmor"]').val()),
                defense: parseInt($('input[name="targetlevel"]').val()) * 5,
                resistance: parseInt($('input[name="targetresistance"]').val()),
                speed: parseFloat($('input[name="targetspeed"]').val()) * 1000,
                mindmg: parseInt($('input[name="targetmindmg"]').val()),
                maxdmg: parseInt($('input[name="targetmaxdmg"]').val()),
                bleedreduction: $('select[name="bleedreduction"]').val(),
            },
        };
    }
    constructor(testItem, testType, enchtype, config) {
        if (!config) config = Player.getConfig();
        this.rage = 0;
        this.ragemod = 1;
        this.level = config.level;
        this.rageconversion = ((0.0091107836 * this.level * this.level) + 3.225598133 * this.level) + 4.2652911;
        if (this.level == 25) this.rageconversion = 82.25;
        if (this.level == 40) this.rageconversion = 140.5;
        this.agipercrit = this.getAgiPerCrit(this.level);
        this.timer = 0;
        this.itemtimer = 0;
        this.stancetimer = 0;
        this.ragetimer = 0;
        this.ragegained = 0;
        this.rageoverflow = 0;
        this.ragestancelost = 0;
        this.ragesrc = {};
        this.hsopp = {};
        this.ragespent = {};
        this.dodgetimer = 0;
        this.crittimer = 0;
        this.critdmgbonus = 0;
        this.mainspelldmg = 1;
        this.extraattacks = 0;
        this.batchedextras = 0;
        this.nextswinghs = false;
        this.nextswingcl = false;
        this.freeslam = false;
        this.ragecostbonus = 0;
        this.logging = config.logging;
        this.race = config.race;
        this.aqbooks = config.aqbooks;
        this.reactionmin = config.reactionmin;
        this.reactionmax = config.reactionmax;
        this.adjacent = config.adjacent;
        this.spelldamage = 0;
        this.target = config.target;
        this.mode = config.mode;
        this.proposal = !!config.proposal; // RAGE NORM build 19: PROPOSAL (LOCKED SETTINGS) rage formula
        this.bleedmod = parseFloat(this.target.bleedreduction);
        this.spellqueueing = config.spellqueueing;
        // RAGE NORM: normalized white-hit rage (threshold + smooth cap on hasted swing time)
        this.forever = config.forever && config.forever.ver !== undefined ? config.forever : null;
        this.ragenorm = !this.forever && config.ragenorm && config.ragenorm.on ? config.ragenorm : null;
        // Forever talents (Unbridled Wrath %, white swings only; Dual Wield Spec off-hand hit). Always on in Forever rage modes;
        // with Classic or Curved rage, on when the "Forever talents" variant is 1.
        this.uwcfg = config.uw || { pct: 40, mech: 'classic' }; this.dwmech = config.dwmech == 'forever' ? 'forever' : 'classic'; this.rmauto = config.rmauto == 'forever' ? 'forever' : 'classic'; this.rmhs = config.rmhs == 'forever' ? 'forever' : 'classic'; this.hsmech = config.hsmech == 'forever' ? 'forever' : 'classic';
        this.fphit = config.fphit || 0;
        this.pendingwf = 0;
        this.wfswing = false;
        this.target.misschance = this.getTargetSpellMiss();
        this.target.mitigation = this.getTargetSpellMitigation();
        this.target.binaryresist = this.getTargetSpellBinaryResist();
        // RAGE NORM: manual test stats (bonus hit/crit, boss dodge reduction)
        this.custom = config.custom || { hit: 0, crit: 0, dodgered: 0 };
        // Ability variants (defaults = Classic): BT AP coefficient, Flurry haste/charges, Death Wish dmg/duration, Execute cooldown
        this.variants = Object.assign({ btap: 0.45, btflat: 0, wwoh: 0, wwcost: 25, flurryhaste: 0, flurrycharges: 3, dwdmg: 20, dwdur: 30, execd: 0 }, config.variants || {});
        this.target.dodge = this.custom.dodgered || 0;
        this.timeworn = 0;
        this.dodgetimeworn = 0;
        this.base = {
            ap: 0,
            agi: 0,
            str: 0,
            hit: 0,
            crit: 0,
            spellcrit: 0,
            skill_0: this.level * 5,
            skill_1: this.level * 5,
            skill_2: this.level * 5,
            skill_3: this.level * 5,
            skill_4: this.level * 5,
            skill_5: this.level * 5,
            skill_6: this.level * 5,
            skill_7: (this.level < 35 ? 225 : 300),
            skill_10: 0,
            skill_11: 0,
            skill_13: 0,
            skill_20: 0,
            skill_21: 0,
            skill_23: 0,
            haste: 1,
            expertise: 0,
            strmod: 1,
            agimod: 1,
            dmgmod: 1,
            spelldmgmod: 1,
            moddmgdone: 0,
            moddmgtaken: 0,
            apmod: 1,
            baseapmod: 1,
            resist: {
                shadow: 0,
                arcane: 0,
                nature: 0,
                fire: 0,
                frost: 0,
            },
            block: 0,
            defense: 0,
        };
        if (enchtype == 1) {
            this.testEnch = testItem;
            this.testEnchType = testType;
        }
        else if (enchtype == 2) {
            this.testTempEnch = testItem;
            this.testTempEnchType = testType;
        }
        else if (enchtype == 3) {
            if (testType == 0) {
                this.base.ap += testItem;
            }
            else if (testType == 1) {
                this.base.crit += testItem;
            }
            else if (testType == 2) {
                this.base.hit += testItem;
            }
            else if (testType == 3) {
                this.base.str += testItem;
            }
            else if (testType == 4) {
                this.base.agi += testItem;
            }
        }
        else {
            this.testItem = testItem;
            this.testItemType = testType;
        }
        this.base.hit += this.custom.hit || 0;
        this.base.crit += this.custom.crit || 0;
        this.stats = {};
        this.auras = {};
        this.spells = {};
        this.items = [];
        this.addRace();
        this.addTalents();
        this.addGear();
        if (!this.mh) return;
        this.addSets();
        this.addEnchants();
        this.addTempEnchants();
        this.preAddRunes();
        this.addBuffs();
        this.addSpells(testItem);
        this.sortSpells();
        this.addRunes();
        this.setSkills();
        if (this.talents.flurry) this.auras.flurry = new Flurry(this);
        if (this.talents.deepwounds) this.auras.deepwounds = this.mode == "sod" ? new DeepWounds(this) : this.dwmech == "forever" ? new ForeverDeepWounds(this) : new OldDeepWounds(this);
        if (this.adjacent && this.talents.deepwounds) {
            for (let i = 2; i <= (this.adjacent + 1); i++)
                this.auras['deepwounds' + i] = this.mode == "sod" ? new DeepWounds(this, null, i) : this.dwmech == "forever" ? new ForeverDeepWounds(this, null, i) : new OldDeepWounds(this, null, i);
        }

        this.spells.stanceswitch = new StanceSwitch(this);
        if (this.spells.bloodrage) this.auras.bloodrage = new BloodrageAura(this);
        if (this.spells.berserkerrage) this.auras.berserkerrage = new BerserkerRageAura(this);
        if (this.spells.shieldslam) this.auras.defendersresolve = new DefendersResolve(this);
        
        if ((this.basestance == 'def' || this.basestance == 'glad') && this.spells.sunderarmor && this.devastate && this.shield) {
            this.spells.sunderarmor.devastate = true;
            this.spells.sunderarmor.nocrit = false;
        }

        
        if (this.items.includes(233490)) {
            this.auras.obsidianstrength = new ObsidianStrength(this);
            this.auras.obsidianhaste = new ObsidianHaste(this);
        } 

        this.update();
        if (this.oh)
            this.oh.timer = Math.round(this.oh.speed * 1000 / this.stats.haste / 2);
    }
    initStances() {
        this.stance = this.basestance;
        this.auras.battlestance = new BattleStance(this);
        this.auras.berserkerstance = new BerserkerStance(this);
        this.auras.defensivestance = new DefensiveStance(this);
        this.auras.gladiatorstance = new GladiatorStance(this);
        if (this.basestance == 'battle') this.auras.battlestance.timer = 1;
        if (this.basestance == 'zerk') this.auras.berserkerstance.timer = 1;
        if (this.basestance == 'def') this.auras.defensivestance.timer = 1;
        if (this.basestance == 'glad') this.auras.gladiatorstance.timer = 1;

        // Might set bonus
        if (this.spells.unstoppablemight && this.spells.unstoppablemight.switchstart) {
            this.switch(this.spells.unstoppablemight.secondarystance);
        }
    }
    addRace() {
        for(let l of levelstats) {
            let raceid;
            if (this.race == "Human") raceid = "1";
            if (this.race == "Orc") raceid = "2";
            if (this.race == "Dwarf") raceid = "3";
            if (this.race == "Night Elf") raceid = "4";
            if (this.race == "Undead") raceid = "5";
            if (this.race == "Tauren") raceid = "6";
            if (this.race == "Gnome") raceid = "7";
            if (this.race == "Troll") raceid = "8";

            // race,class,level,str,agi,sta,inte,spi
            let stats = l.split(",");
            if (stats[0] == raceid && stats[2] == this.level) {
                this.base.aprace = (this.level * 3) - 20;
                this.base.ap += (this.level * 3) - 20;
                this.base.str += parseInt(stats[3]);
                this.base.agi += parseInt(stats[4]);
                this.base.skill_0 += raceid == "1" ? 5 : 0;
                this.base.skill_1 += raceid == "1" ? 5 : 0;
                this.base.skill_2 += 0;
                this.base.skill_3 += raceid == "2" ? 5 : 0;
            }
        }
    }
    addTalents() {
        this.talents = {};
        for (let tree in talents) {
            for (let talent of talents[tree].t) {
                this.talents = Object.assign(this.talents, talent.aura(talent.c));
            }
        }
        if (this.talents.defense) this.base.defense += this.talents.defense;
    }
    addGear() {
        for (let type in gear) {
            for (let item of gear[type]) {
                if ((this.testItemType == type && this.testItem == item.id) ||
                    (this.testItemType != type && item.selected)) {
                    for (let prop in this.base) {
                        if (prop == 'haste') {
                            this.base.haste *= (1 + item.haste / 100) || 1;
                        } else {
                            if (typeof item[prop] === 'object') {
                                for (let subprop in item[prop]) {
                                    this.base[prop][subprop] += item[prop][subprop] || 0;
                                }
                            } else {
                                if (item[prop]) {
                                    this.base[prop] += item[prop] || 0;
                                }
                            }
                        }
                    }
                    if (item.skill && item.skill > 0) {
                        let sk = WEAPONTYPE[item.type.replace(' ','').toUpperCase()];
                        this.base['skill_' + sk] += item.skill;
                    }
                    if (item.skills) {
                        Object.keys(item.skills).forEach(key => {
                            this.base['skill_' + key] += item.skills[key];
                        });
                    }

                    if (item.d) this.base.defense += item.d;

                    if (type == "mainhand" || type == "offhand" || type == "twohand")
                        this.addWeapon(item, type);


                    if (item.proc && item.proc.chance && (type == "trinket1" || type == "trinket2")) {
                        let proc = {};
                        proc.chance = item.proc.chance * 100;
                        proc.extra = item.proc.extra;
                        proc.magicdmg = item.proc.dmg;
                        proc.cooldown = item.proc.cooldown;
                        if (item.spell) {
                            this.auras[item.proc.spell.toLowerCase()] = eval('new ' + item.proc.spell + '(this)');
                            proc.spell = this.auras[item.proc.spell.toLowerCase()];
                        }
                        this["trinketproc" + (this.trinketproc1 ? 2 : 1)] = proc;
                    }
                    else if (item.proc && item.proc.chance) {
                        let proc = {}
                        proc.chance = item.proc.chance * 100;
                        if (item.proc.dmg) proc.magicdmg = item.proc.dmg;
                        if (item.proc.spell) {
                            this.auras[item.proc.spell.toLowerCase()] = eval('new ' + item.proc.spell + '(this)');
                            proc.spell = this.auras[item.proc.spell.toLowerCase()];
                        }
                        if (this.attackproc2) console.log("Warning! overlapping attack procs!");
                        if (!this.attackproc1) this.attackproc1 = proc;
                        else this.attackproc2 = proc;
                    }

                    if (item.id == 21189)
                        this.base['moddmgdone'] += 4;
                    if (item.id == 19968)
                        this.base['moddmgdone'] += 2;
                    if (item.id == 215166)
                        this.base['moddmgdone'] += 3;
                    if (item.id == 228089)
                        this.base['moddmgdone'] += 4;
                    if (item.id == 227809)
                        this.base['moddmgdone'] += 3;
                    if (item.id == 230003 || item.id == 23000399)
                        this.base['moddmgdone'] += 4;
                    if (item.id == 233638)
                        this.base['moddmgdone'] += 3;
                    if (item.id == 234761)
                        this.base['moddmgdone'] += 4;
                    if (item.id == 234084)
                        this.base['moddmgdone'] += 3;
                    if (item.id == 234065)
                        this.base['moddmgdone'] += 2;
                    if (item.id == 234147)
                        this.base['moddmgdone'] += 4;
                    
                    
                    
                    
                    if (item.id == 228122)
                        this.spells.themoltencore = new TheMoltenCore(this);

                    if (item.tw) {
                        this.timeworn++;
                        this.dodgetimeworn++;
                    }

                    this.items.push(item.id);
                }
            }
        }
    }
    addWeapon(item, type) {

        let ench, tempench;
        for (let item of enchant[type]) {
            if (item.temp) continue;
            if (this.testEnchType == type && this.testEnch == item.id) ench = item;
            else if (this.testEnchType != type && item.selected) ench = item;
        }
        for (let item of enchant[type]) {
            if (!item.temp) continue;
            if (this.testTempEnchType == type && this.testTempEnch == item.id) tempench = item;
            else if (this.testTempEnchType != type && item.selected) tempench = item;
        }

        if (type == "mainhand")
            this.mh = new Weapon(this, item, ench, tempench, false, false);

        if (type == "offhand" && item.type != "Shield")
            this.oh = new Weapon(this, item, ench, tempench, true, false);

        if (type == "offhand" && item.type == "Shield")
            this.shield = item;

        if (type == "twohand")
            this.mh = new Weapon(this, item, ench, tempench, false, true);

    }
    addEnchants() {
        for (let type in enchant) {
            for (let item of enchant[type]) {
                if (item.temp) continue;
                if ((this.testEnchType == type && this.testEnch == item.id) ||
                    (this.testEnchType != type && item.selected)) {

                    for (let prop in this.base) {
                        if (prop == 'haste') {
                            this.base.haste *= (1 + item.haste / 100) || 1;
                        } else {
                            if (typeof item[prop] === 'object') {
                                for (let subprop in item[prop]) {
                                    this.base[prop][subprop] += item[prop][subprop] || 0;
                                }
                            } else {
                                if (item[prop]) {
                                    this.base[prop] += item[prop] || 0;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    addTempEnchants() {
        for (let type in enchant) {
            for (let item of enchant[type]) {
                if (!item.temp) continue;
                if ((type == "mainhand" || type == "twohand") && this.mh.windfury) continue;
                if ((this.testTempEnchType == type && this.testTempEnch == item.id) ||
                    (this.testTempEnchType != type && item.selected)) {

                    for (let prop in this.base) {
                        if (prop == 'haste') {
                            this.base.haste *= (1 + item.haste / 100) || 1;
                        } else {
                            if (typeof item[prop] === 'object') {
                                for (let subprop in item[prop]) {
                                    this.base[prop][subprop] += item[prop][subprop] || 0;
                                }
                            } else {
                                if (item[prop]) {
                                    this.base[prop] += item[prop] || 0;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    preAddRunes() {
        if (typeof runes === "undefined") return;
        for (let type in runes) {
            for (let item of runes[type]) {
                if (item.selected) {
                    if (item.focusedrage) {
                        this.ragecostbonus = 3;
                    }
                    if (item.precisetiming) {
                        this.precisetiming = item.precisetiming;
                    }
                }
            }
        }
    }
    addRunes() {
        if (typeof runes === "undefined") return;
        for (let type in runes) {
            for (let item of runes[type]) {
                if (item.selected) {
                    // Blood Frenzy
                    if (item.bloodfrenzy) {
                        this.bloodfrenzy = item.bloodfrenzy;
                    }
                    // Endless Rage
                    if (item.ragemod) {
                        this.base.ragemod = (this.base.ragemod || 1) * item.ragemod;
                    }
                    // Frenzied Assault
                    if (item.haste2h && this.mh.twohand) {
                        this.base.haste *= (1 + item.haste2h / 100) || 1;
                        this.extrarage = 2;
                        this.extracritrage = 4;
                    }
                    if (item.furiousthunder) {
                        this.furiousthunder = item.furiousthunder;
                    }
                    if (item.dmgdw && this.oh) {
                        this.base.dmgmod *= (1 + item.dmgdw / 100) || 1;
                    }
                    if (item.devastate) {
                        this.devastate = item.devastate;
                    }
                    if (item.bloodsurge) {
                        this.bloodsurge = item.bloodsurge;
                    }
                    if (item.swordboard) {
                        this.swordboard = item.swordboard;
                    }
                    if (item.wreckingcrew) {
                        this.wreckingcrew = item.wreckingcrew;
                        this.auras.wreckingcrew = new WreckingCrew(this);
                    }
                    if (item.dmgshield && this.shield) {
                        this.base.dmgmod *= (1 + item.dmgshield / 100) || 1;
                    }
                    if (item.tasteforblood) {
                        this.tasteforblood = item.tasteforblood;
                    }
                    if (item.freshmeat) {
                        this.freshmeat = item.freshmeat;
                        this.auras.freshmeat = new FreshMeat(this);
                    }
                    if (item.suddendeath) {
                        this.suddendeath = item.suddendeath;
                        this.auras.suddendeath = new SuddenDeath(this);
                    }
                    if (item.singleminded) {
                        this.auras.singleminded = new SingleMinded(this);
                    }
                }
            }
        }
    }
    addSets() {
        for (let set of sets) {
            let counter = 0;
            for (let item of set.items)
                if (this.items.includes(item))
                    counter++;
            if (counter == 0)
                continue;
            for (let bonus of set.bonus) {
                if (counter >= bonus.count) {
                    for (let prop in bonus.stats) {
                        if (typeof bonus.stats[prop] === 'object') {
                            for (let subprop in bonus.stats[prop]) {
                                this.base[prop][subprop] += bonus.stats[prop][subprop] || 0;
                            }
                        }
                        else {
                            this.base[prop] += bonus.stats[prop] || 0;
                        }
                    }

                    if (bonus.stats.procchance) {
                        let proc = {}
                        proc.chance = bonus.stats.procchance * 100;
                        if (bonus.stats.magicdmg) proc.magicdmg = bonus.stats.magicdmg;
                        if (bonus.stats.procspell) {
                            this.auras[bonus.stats.procspell.toLowerCase()] = eval('new ' + bonus.stats.procspell + '(this)');
                            proc.spell = this.auras[bonus.stats.procspell.toLowerCase()];
                        } 
                        if (this.attackproc2) console.log("Warning! overlapping attack procs!");
                        if (!this.attackproc1) this.attackproc1 = proc;
                        else this.attackproc2 = proc;
                    }
                    if (bonus.stats.enhancedbs) {
                        this.enhancedbs = true;
                    }
                    if (bonus.stats.wailingextra) {
                        this.wailingextra = bonus.stats.wailingextra;
                    }
                    if (bonus.stats.hakkariextra) {
                        this.hakkariextra = bonus.stats.hakkariextra;
                    }
                    if (bonus.stats.switchrage) {
                        this.switchrage = bonus.stats.switchrage;
                    }
                    if (bonus.stats.switchdelay) {
                        this.switchdelay = bonus.stats.switchdelay;
                        this.auras.echoesbattle = new EchoesBattle(this);
                        this.auras.echoeszerk = new EchoesZerk(this);
                        this.auras.echoesglad = new EchoesGlad(this);
                        this.auras.echoesdef = new EchoesDef(this);
                    }
                    if (bonus.stats.switchbonus) {
                        this.auras.battleforecast = new BattleForecast(this);
                        this.auras.zerkforecast = new ZerkForecast(this);
                        this.auras.defforecast = new DefForecast(this);
                        this.auras.gladforecast = new GladForecast(this);
                    }
                    if (bonus.stats.overpowerrend) this.overpowerrend = bonus.stats.overpowerrend;
                    if (bonus.stats.heroicbonus) this.heroicbonus = bonus.stats.heroicbonus;
                    if (bonus.stats.slammainreset) this.slammainreset = bonus.stats.slammainreset;
                    if (bonus.stats.shieldslamcd) this.shieldslamcd = bonus.stats.shieldslamcd;
                    if (bonus.stats.gladbloodrage) this.gladbloodrage = bonus.stats.gladbloodrage;
                    if (bonus.stats.whirlwindcost) this.whirlwindcost = bonus.stats.whirlwindcost;
                    if (bonus.stats.deathwishcd) this.deathwishcd = bonus.stats.deathwishcd;
                    if (bonus.stats.bleedbonus) this.bleedbonus = bonus.stats.bleedbonus;
                    if (bonus.stats.shockwavecd) this.shockwavecd = bonus.stats.shockwavecd;
                }
            }
        }
    }
    addBuffs() {
        this.target.basearmorbuffed = this.target.basearmor;
        for (let buff of buffs) {
            if (buff.active && buff.improvedexposed) {
                this.improvedexposed = true;
            }
            if (buff.active && buff.name == "Expose Armor") {
                this.exposed = true;
            }
            if (buff.active && buff.name == "Homunculi") {
                this.homunculi = true;
            }
        }
        for (let buff of buffs) {
            if (buff.active) {
                let ap = 0, str = 0, agi = 0;
                if (buff.name == "Blessing of Might") {
                    let impmight = buffs.filter(s => s.mightmod && s.active)[0];
                    ap = ~~(buff.ap * (impmight ? impmight.mightmod : 1));
                }
                if (buff.name == "Mark of the Wild") {
                    let impmotw = buffs.filter(s => s.motwmod && s.active)[0];
                    str = ~~(buff.str * (impmotw ? impmotw.motwmod : 1));
                    agi = ~~(buff.agi * (impmotw ? impmotw.motwmod : 1));
                }
                if (buff.group == "vaelbuff")
                    this.vaelbuff = true;
                if (buff.group == "dragonbreath")
                    this.dragonbreath = true;
                if (buff.bleedmod)
                    this.bleedmod *= buff.bleedmod;
                if (buff.armor) 
                    this.target.basearmorbuffed -= buff.armor + ((buff.name == "Expose Armor" || buff.name == "Sebacious Poison") && this.improvedexposed ? buff.armor * 0.5 : 0);
                if (buff.armorperlevel) 
                    this.target.basearmorbuffed -= (buff.armorperlevel * this.level);
                if (buff.name == "Faerie Fire")
                    this.faeriefire = true;
                if (buff.dmgshield && this.shield)
                    this.base.dmgmod *= (1 + buff.dmgshield / 100) || 1;
                if (buff.voodoofrenzy)
                    this.auras.voodoofrenzy = new VoodooFrenzy(this);
                if (buff.stance) {
                    this.basestance = buff.stance;
                    if (buff.stance == 'glad' && this.gladdmg && this.shield)
                        this.base.dmgmod *= (1 + this.gladdmg / 100);
                    continue;
                }
                if (buff.group == "trueshot" && this.mode == "sod") {
                    buff.ap = buff.apsod;
                }
                if (buff.dodge) {
                    this.target.dodge += buff.dodge;
                }
                    
                this.base.ap += ap || buff.ap || 0;
                this.base.agi += agi || buff.agi || 0;
                this.base.str += str || buff.str || 0;
                this.base.crit += buff.crit || 0;
                this.base.hit += buff.hit || 0;
                this.base.spellcrit += buff.spellcrit || 0;
                this.base.agimod *= (1 + buff.agimod / 100) || 1;
                this.base.strmod *= (1 + buff.strmod / 100) || 1;
                this.base.dmgmod *= (1 + buff.dmgmod / 100) || 1;
                this.base.spelldmgmod *= (1 + buff.spelldmgmod / 100) || 1;
                this.base.haste *= (1 + buff.haste / 100) || 1;
                this.base.moddmgdone += buff.moddmgdone || 0;
                this.base.moddmgtaken += buff.moddmgtaken || 0;
                this.base.defense += buff.defense || 0;

                this.base.skill_0 += this.race == "Human" ? 0 : (buff.skill_0 || 0);
                this.base.skill_1 += this.race == "Human" ? 0 : (buff.skill_1 || 0);
                this.base.skill_2 += buff.skill_2 || 0;
                this.base.skill_3 += this.race == "Orc" ? 0 : (buff.skill_3 || 0);
                this.base.skill_4 += buff.skill_4 || 0;
                this.base.skill_5 += buff.skill_5 || 0;
                this.base.skill_6 += buff.skill_6 || 0;
                this.base.skill_7 += buff.skill_7 || 0;

                if (buff.resist) {
                    let impmotw = buff.name == "Mark of the Wild" && buffs.filter(s => s.motwmod && s.active)[0];
                    if (buff.name == "Mark of the Wild" && buffs.filter(s => s.mrp && s.active)[0]) continue;
                    if ((buff.name == "Mark of the Wild" || buff.mrp) && buffs.filter(s => s.fra && s.active)[0]) continue;
                    this.base.resist.fire += ~~(buff.resist.fire * (impmotw ? impmotw.motwmod : 1) || 0);
                    this.base.resist.frost += ~~(buff.resist.frost * (impmotw ? impmotw.motwmod : 1) || 0);
                    this.base.resist.nature += ~~(buff.resist.nature * (impmotw ? impmotw.motwmod : 1) || 0);
                    this.base.resist.shadow += ~~(buff.resist.shadow * (impmotw ? impmotw.motwmod : 1) || 0);
                }
                
            }
        }
        this.target.basearmorbuffed = Math.max(this.target.basearmorbuffed, 0);
        if (typeof $ !== 'undefined')
            $("#currentarmor").text(this.target.basearmorbuffed);

        // timeworn
        if (!this.items.includes(234034) && !this.items.includes(234202)) {
            this.timeworn = 0;
        }
        if (!this.items.includes(234035)) {
            this.dodgetimeworn = 0;
        }
    }
    addSpells(testItem) {
        this.preporder = [];
        for (let spell of spells) {
            if (spell.item && this.items.includes(spell.id) && spell.id == testItem && spell.id == testItem && !spell.timetoendactive && !spell.timetostartactive) {
                // Blademasters Fury
                if (spell.id == 219223) spell.active = true;
                else spell.timetoendactive = true;
            }
            if (spell.active || (spell.item && this.items.includes(spell.id) && (spell.timetoendactive || spell.timetostartactive))) {
                if (!spell.aura && this.mh.type == WEAPONTYPE.FISHINGPOLE) continue; 
                if (spell.item && !this.items.includes(spell.id)) continue;
                if (spell.aura) this.auras[spell.classname.toLowerCase()] = eval(`new ${spell.classname}(this, ${spell.id})`);
                else this.spells[spell.classname.toLowerCase()] = eval(`new ${spell.classname}(this, ${spell.id})`);
                this.preporder.push(spell);
            }
        }
        // sort by timetoend to prepare for usestep calculations
        this.preporder.sort((a, b) => { return a.timetoend - b.timetoend; });
    }
    sortSpells() {
        this.normalspells = [];
        this.executespells = [];

        for(let i = 10; i > 0; i--) {
            for(let s in this.spells) {
                if (this.spells[s].priority == i) this.normalspells.push(this.spells[s]);
                if (this.spells[s].expriority == i) this.executespells.push(this.spells[s]);
            }
            for(let a in this.auras) {
                if (this.auras[a].priority == i) this.normalspells.push(this.auras[a]);
                if (this.auras[a].expriority == i) this.executespells.push(this.auras[a]);
            }
        }

        this.normalspells_c = this.normalspells.length;
        this.executespells_c = this.executespells.length;

    }
    setSkills() {
        this.base.skill_0 += this.mh.twohand ? this.base.skill_20 : this.base.skill_10;
        this.base.skill_1 += this.mh.twohand ? this.base.skill_21 : this.base.skill_11;
        this.base.skill_3 += this.mh.twohand ? this.base.skill_23 : this.base.skill_13;
    }
    reset(rage) {
        this.rage = rage;
        this.ragegained = 0;
        this.rageoverflow = 0;
        this.ragestancelost = 0;
        this.ragesrc = {};
        this.hsopp = {};
        this.ragespent = {};
        if (rage > 0) this.ragesrc['Starting Rage|'] = { n: 1, casts: 0, gen: rage, over: 0 };
        this.timer = 0;
        this.itemtimer = 0;
        this.stancetimer = 0;
        this.ragetimer = 0;
        this.dodgetimer = 0;
        this.crittimer = 0;
        this.critdmgbonus = 0;
        this.mainspelldmg = 1;
        this.spelldelay = 0;
        this.heroicdelay = 0;
        this.mh.timer = 0;
        if (this.oh)
            this.oh.timer = Math.round(this.oh.speed * 1000 / this.stats.haste / 2);
        this.extraattacks = 0;
        this.batchedextras = 0;
        this.pendingwf = 0;
        this.wfswing = false;
        this.nextswinghs = false;
        this.nextswingcl = false;
        this.freeslam = false;
        for (let s in this.spells) {
            this.spells[s].timer = 0;
            this.spells[s].stacks = 0;
        }
        for (let s in this.auras) {
            this.auras[s].timer = 0;
            this.auras[s].firstuse = true;
            this.auras[s].stacks = 0;
            if (this.auras[s].ticksleft) this.auras[s].ticksleft = 0;
            if (this.auras[s].saveddmg) this.auras[s].saveddmg = 0;
            if (this.auras[s].nexttick) this.auras[s].nexttick = 0;
            if (this.auras[s].cooldowntimer) this.auras[s].cooldowntimer = 0;
            if (this.auras[s].tfbstep) this.auras[s].tfbstep = -6000;
        }
        if (this.trinketproc1 && this.trinketproc1.usestep) this.trinketproc1.usestep = 0;
        if (this.trinketproc2 && this.trinketproc2.usestep) this.trinketproc2.usestep = 0;
        if (this.auras.deepwounds) {
            this.auras.deepwounds.idmg = 0;
        }
        if (this.auras.deepwounds2) {
            this.auras.deepwounds2.idmg = 0;
        }
        if (this.auras.deepwounds3) {
            this.auras.deepwounds3.idmg = 0;
        }
        if (this.auras.deepwounds4) {
            this.auras.deepwounds4.idmg = 0;
        }
        if (this.auras.rend) {
            this.auras.rend.idmg = 0;
        }
        if (this.auras.weaponbleedmh) {
            this.auras.weaponbleedmh.idmg = 0;
        }
        if (this.auras.weaponbleedoh) {
            this.auras.weaponbleedoh.idmg = 0;
        }
        if (this.spells.fireball) {
            this.spells.fireball.idmg = 0;
        }
        if (this.spells.gunaxe) {
            this.spells.gunaxe.idmg = 0;
        }
        if (this.spells.themoltencore) {
            this.spells.themoltencore.idmg = 0;
        }
        this.initStances();
        this.update();
    }
    update() {
        this.updateAuras();
        this.updateArmorReduction();
        this.mh.glanceChance = this.getGlanceChance(this.mh);
        this.mh.miss = this.getMissChance(this.mh);
        this.mh.dwmiss = this.mh.miss;
        this.mh.dodge = this.getDodgeChance(this.mh);

        if (this.oh) {
            this.mh.dwmiss = this.getDWMissChance(this.mh);
            this.oh.glanceChance = this.getGlanceChance(this.oh);
            this.oh.miss = this.getMissChance(this.oh);
            this.oh.dwmiss = this.getDWMissChance(this.oh);
            this.oh.dodge = this.getDodgeChance(this.oh);
            // FOREVER: Furious Precision (Fury, 4/7/10% off-hand hit). Every Fury build takes 3/3 = 10.
            // (Dual Wield Specialization lost its off-hand hit in the 1 Oct 2026 beta build.)
            if (this.fphit) {
                const b = this.fphit;
                this.oh.miss = Math.max(this.oh.miss - b, 0);
                this.oh.dwmiss = Math.max(this.oh.dwmiss - b, 0);
            }
        }
    }
    updateAuras() {
        for (let prop in this.base)
            this.stats[prop] = this.base[prop];
        for (let name in this.auras) {
            if (this.auras[name].timer) {
                for (let prop in this.auras[name].stats)
                    this.stats[prop] += this.auras[name].stats[prop];
                for (let prop in this.auras[name].mult_stats)
                    this.stats[prop] *= (1 + this.auras[name].mult_stats[prop] / 100);
            }
        }
        this.stats.str = ~~(this.stats.str * this.stats.strmod);
        this.stats.agi = ~~(this.stats.agi * this.stats.agimod);
        this.stats.ap += this.stats.str * 2;
        this.stats.crit += this.stats.agi * this.agipercrit;
        this.crit = this.getCritChance();
        this.stats.block = this.stats.block + ~~(this.stats.str / 20);

        if (this.stats.baseapmod != 1)
            this.stats.ap += ~~((this.base.aprace + this.stats.str * 2) * (this.stats.baseapmod - 1));
        this.stats.ap = ~~(this.stats.ap * this.stats.apmod);
    }
    getAgiPerCrit(level) {
        let table = [0.2500, 0.2381, 0.2381, 0.2273, 0.2174, 0.2083, 0.2083, 0.2000, 0.1923, 0.1923,0.1852, 0.1786, 0.1667, 0.1613, 0.1563, 0.1515, 0.1471, 0.1389, 0.1351, 0.1282,0.1282, 0.1250, 0.1190, 0.1163, 0.1111, 0.1087, 0.1064, 0.1020, 0.1000, 0.0962,0.0943, 0.0926, 0.0893, 0.0877, 0.0847, 0.0833, 0.0820, 0.0794, 0.0781, 0.0758,0.0735, 0.0725, 0.0704, 0.0694, 0.0676, 0.0667, 0.0649, 0.0633, 0.0625, 0.0610,0.0595, 0.0588, 0.0575, 0.0562, 0.0549, 0.0543, 0.0532, 0.0521, 0.0510, 0.0500];
        return table[parseInt(level) - 1];
    }
    getTargetSpellMiss() {
        let resist = 100;
        let diff = this.target.level - this.level;
        if (diff == -2) resist = 200;
        if (diff == -1) resist = 300;
        if (diff == 0) resist = 400;
        if (diff == 1) resist = 500;
        if (diff == 2) resist = 600;
        if (diff == 3) resist = 1700;
        if (diff == 4) resist = 2800;
        if (diff > 4) resist = 2800 + (1100 * (diff - 4));
        return resist;
    }
    getTargetSpellMitigation() {
        return 1 - 15 * (this.target.resistance / (this.level * 100));
    }
    getTargetSpellBinaryResist() {
        return parseInt(10000 - ((10000 - this.target.misschance) * (1 - (this.target.resistance * 0.15 / (this.level * 100)))))
    }
    updateStrength() {
        this.stats.str = this.base.str;
        this.stats.ap = this.base.ap;
        this.stats.apmod = this.base.apmod;
        this.stats.baseapmod = this.base.baseapmod;

        for (let name in this.auras) {
            if (this.auras[name].timer) {
                if (this.auras[name].stats.str)
                    this.stats.str += this.auras[name].stats.str;
                if (this.auras[name].stats.ap)
                    this.stats.ap += this.auras[name].stats.ap;
                if (this.auras[name].mult_stats.apmod)
                    this.stats.apmod *= (1 + this.auras[name].mult_stats.apmod / 100);
                if (this.auras[name].mult_stats.baseapmod)
                    this.stats.baseapmod *= (1 + this.auras[name].mult_stats.baseapmod / 100);
            }
        }
        this.stats.str = ~~(this.stats.str * this.stats.strmod);
        this.stats.ap += this.stats.str * 2;
        this.stats.block = this.base.block + ~~(this.stats.str / 20);

        if (this.stats.baseapmod != 1)
            this.stats.ap += ~~((this.base.aprace + this.stats.str * 2) * (this.stats.baseapmod - 1));
        this.stats.ap = ~~(this.stats.ap * this.stats.apmod);
    }
    updateAP() {
        this.stats.ap = this.base.ap;
        this.stats.apmod = this.base.apmod;
        this.stats.baseapmod = this.base.apmod;
        for (let name in this.auras) {
            if (this.auras[name].timer && this.auras[name].stats.ap) {
                this.stats.ap += this.auras[name].stats.ap;
            }
            if (this.auras[name].timer && this.auras[name].mult_stats.apmod) {
                this.stats.apmod *= (1 + this.auras[name].mult_stats.apmod / 100);
            }
            if (this.auras[name].timer && this.auras[name].mult_stats.baseapmod) {
                this.stats.baseapmod *= (1 + this.auras[name].mult_stats.baseapmod / 100);
            }
        }
        this.stats.ap += this.stats.str * 2;

        if (this.stats.baseapmod != 1)
            this.stats.ap += ~~((this.base.aprace + this.stats.str * 2) * (this.stats.baseapmod - 1));
        this.stats.ap = ~~(this.stats.ap * this.stats.apmod);
    }
    updateHaste() {
        this.stats.haste = this.base.haste;
        if (this.auras.flurry && this.auras.flurry.timer)
            this.stats.haste *= (1 + this.auras.flurry.mult_stats.haste / 100);
        if (this.auras.berserking && this.auras.berserking.timer)
            this.stats.haste *= (1 + this.auras.berserking.mult_stats.haste / 100);
        if (this.auras.empyrean && this.auras.empyrean.timer)
            this.stats.haste *= (1 + this.auras.empyrean.mult_stats.haste / 100);
        if (this.auras.eskhandar && this.auras.eskhandar.timer)
            this.stats.haste *= (1 + this.auras.eskhandar.mult_stats.haste / 100);
        if (this.auras.pummeler && this.auras.pummeler.timer)
            this.stats.haste *= (1 + this.auras.pummeler.mult_stats.haste / 100);
        if (this.auras.spider && this.auras.spider.timer)
            this.stats.haste *= (1 + this.auras.spider.mult_stats.haste / 100);
        if (this.auras.voidmadness && this.auras.voidmadness.timer)
            this.stats.haste *= (1 + this.auras.voidmadness.mult_stats.haste / 100);
        if (this.auras.jackhammer && this.auras.jackhammer.timer)
            this.stats.haste *= (1 + this.auras.jackhammer.mult_stats.haste / 100);
        if (this.auras.ragehammer && this.auras.ragehammer.timer)
            this.stats.haste *= (1 + this.auras.ragehammer.mult_stats.haste / 100);
        if (this.auras.blisteringragehammer && this.auras.blisteringragehammer.timer)
            this.stats.haste *= (1 + this.auras.blisteringragehammer.mult_stats.haste / 100);
        if (this.auras.gyromaticacceleration && this.auras.gyromaticacceleration.timer)
            this.stats.haste *= (1 + this.auras.gyromaticacceleration.mult_stats.haste / 100);
        if (this.auras.gneurological && this.auras.gneurological.timer)
            this.stats.haste *= (1 + this.auras.gneurological.mult_stats.haste / 100);
        if (this.auras.spicy && this.auras.spicy.timer)
            this.stats.haste *= (1 + this.auras.spicy.mult_stats.haste / 100);
        if (this.auras.echoesdread && this.auras.echoesdread.timer)
            this.stats.haste *= (1 + this.auras.echoesdread.mult_stats.haste / 100);
        if (this.auras.singleminded && this.auras.singleminded.timer)
            this.stats.haste *= (1 + this.auras.singleminded.mult_stats.haste / 100);
        if (this.auras.magmadarsreturn && this.auras.magmadarsreturn.timer)
            this.stats.haste *= (1 + this.auras.magmadarsreturn.mult_stats.haste / 100);
        if (this.auras.jujuflurry && this.auras.jujuflurry.timer)
            this.stats.haste *= (1 + this.auras.jujuflurry.mult_stats.haste / 100);
        if (this.auras.crusaderzeal && this.auras.crusaderzeal.timer)
            this.stats.haste *= (1 + this.auras.crusaderzeal.mult_stats.haste / 100);
        if (this.auras.obsidianhaste && this.auras.obsidianhaste.timer)
            this.stats.haste *= (1 + this.auras.obsidianhaste.mult_stats.haste / 100);

    }
    updateHasteDamage() {
        // MOD_ATTACKSPEED works differently than regular haste, lowers dmg
        let mod = 1;
        if (this.auras.spicy && this.auras.spicy.timer)
            mod *= (1 + this.auras.spicy.mult_stats.haste / 100);
        if (this.auras.jujuflurry && this.auras.jujuflurry.timer)
            mod *= (1 + this.auras.jujuflurry.mult_stats.haste / 100);

        this.mh.mindmg = this.mh.basemindmg / mod;
        this.mh.maxdmg = this.mh.basemaxdmg / mod;
        if (this.oh) {
            this.oh.mindmg = this.oh.basemindmg / mod;
            this.oh.maxdmg = this.oh.basemaxdmg / mod;
        }
    }
    updateBonusDmg() {
        let bonus = 0;
        let taken = 0;
        if (this.auras.stoneslayer && this.auras.stoneslayer.timer)
            bonus += this.auras.stoneslayer.stats.moddmgdone;
        if (this.auras.zeal && this.auras.zeal.timer)
            bonus += this.auras.zeal.stats.moddmgdone;
        if (this.auras.zandalarian && this.auras.zandalarian.timer)
            bonus += this.auras.zandalarian.stats.moddmgdone;
        if (this.auras.relentlessstrength && this.auras.relentlessstrength.timer)
            bonus += this.auras.relentlessstrength.stats.moddmgdone;
        if (this.auras.blisteringragehammer && this.auras.blisteringragehammer.timer)
            bonus += this.auras.blisteringragehammer.stats.moddmgdone;
        if (this.auras.meltarmor && this.auras.meltarmor.timer)
            taken += this.auras.meltarmor.stats.moddmgtaken;
        if (this.auras.crusaderzeal && this.auras.crusaderzeal.timer)
            bonus += this.auras.crusaderzeal.stats.moddmgdone;
        if (this.auras.obsidianhaste && this.auras.obsidianhaste.timer)
            bonus += this.auras.obsidianhaste.stats.moddmgdone;
        this.stats.moddmgdone = this.base.moddmgdone + bonus;
        this.stats.moddmgtaken = this.base.moddmgtaken + taken;
        this.mh.bonusdmg = this.mh.basebonusdmg;
        if (this.oh)
            this.oh.bonusdmg = this.oh.basebonusdmg;
    }
    updateArmorReduction() {
        this.target.armor = this.target.basearmorbuffed;
        if (this.auras.annihilator && this.auras.annihilator.timer)
            this.target.armor = Math.max(this.target.armor - (this.auras.annihilator.stacks * this.auras.annihilator.armor), 0);
        if (this.auras.rivenspike && this.auras.rivenspike.timer)
            this.target.armor = Math.max(this.target.armor - (this.auras.rivenspike.stacks * this.auras.rivenspike.armor), 0);
        if (this.auras.vibroblade && this.auras.vibroblade.timer)
            this.target.armor = Math.max(this.target.armor - this.auras.vibroblade.armor, 0);
        if (this.auras.ultrasonic && this.auras.ultrasonic.timer)
            this.target.armor = Math.max(this.target.armor - this.auras.ultrasonic.armor, 0);
        if (this.auras.cleavearmor && this.auras.cleavearmor.timer)
            this.target.armor = Math.max(this.target.armor - this.auras.cleavearmor.armor, 0);
        if (this.auras.bonereaver && this.auras.bonereaver.timer)
            this.target.armor = Math.max(this.target.armor - (this.auras.bonereaver.stacks * this.auras.bonereaver.armor), 0);
        if (this.auras.swarmguard && this.auras.swarmguard.timer)
            this.target.armor = Math.max(this.target.armor - (this.auras.swarmguard.stacks * this.auras.swarmguard.armor), 0);
        this.armorReduction = this.getArmorReduction();
    }
    updateDmgMod() {
        this.stats.dmgmod = this.base.dmgmod;
        this.stats.spelldmgmod = this.base.spelldmgmod;
        for (let name in this.auras) {
            if (this.auras[name].timer && this.auras[name].mult_stats.dmgmod)
                this.stats.dmgmod *= (1 + this.auras[name].mult_stats.dmgmod / 100);
        }
        if (this.bleedbonus && this.auras.rend && this.auras.rend.timer && this.auras.deepwounds && this.auras.deepwounds.timer) {
            this.stats.dmgmod *= 1.1;
        }
            
    }
    getGlanceReduction(weapon) {
        let diff = this.target.defense - this.stats['skill_' + weapon.type];
        let low = Math.max(Math.min(1.3 - 0.05 * diff, 0.91), 0.01);
        let high = Math.max(Math.min(1.2 - 0.03 * diff, 0.99), 0.2);
        return Math.random() * (high - low) + low;
    }
    getGlanceChance(weapon) {
        return 10 + Math.max(this.target.defense - Math.min(this.level * 5, this.stats['skill_' + weapon.type]), 0) * 2;
    }
    getMissChance(weapon) {
        let diff = this.target.defense - this.stats['skill_' + weapon.type];
        let miss = 5 + (diff > 10 ? diff * 0.2 : diff * 0.1);
        miss -= (diff > 10 ? this.stats.hit - 1 : this.stats.hit);
        return miss;
    }
    getDWMissChance(weapon) {
        let diff = this.target.defense - this.stats['skill_' + weapon.type];
        let miss = 5 + (diff > 10 ? diff * 0.2 : diff * 0.1);
        miss = miss * 0.8 + 20;
        miss -= (diff > 10 ? this.stats.hit - 1 : this.stats.hit);
        return miss;
    }
    getCritChance() {
        let crit = this.stats.crit + (this.talents.crit || 0) + (this.level - this.target.level) * 1;
        if ((this.target.level - this.level)  >= 3) crit -= 1.8;
        return Math.max(crit, 0);
    }
    getDodgeChance(weapon) {
        return Math.max(5 - this.stats.expertise - this.dodgetimeworn - this.target.dodge + (this.target.defense - this.stats['skill_' + weapon.type]) * 0.1, 0);
    }
    getArmorReduction() {
        if (isNaN(this.target.armor)) this.target.armor = 0;
        let r = this.target.armor / (this.target.armor + 400 + 85 * this.level);
        return r > 0.75 ? 0.75 : r;
    }
    // Adds rage, clamps at 100 and records it per source (group + detail) for the Rage Generated stats.
    // cast = true marks the event as a use of an ability/item (e.g. Bloodrage, potions) rather than a tick or proc.
    gainRage(amount, group, detail, cast) {
        if (!(amount > 0)) return;
        let key = group + '|' + (detail || '');
        let src = this.ragesrc[key] || (this.ragesrc[key] = { n: 0, casts: 0, gen: 0, over: 0 });
        src.n++;
        if (cast) src.casts++;
        src.gen += amount;
        this.ragegained += amount;
        let total = this.rage + amount;
        if (total > 100) {
            let over = total - 100;
            this.rageoverflow += over;
            src.over += over;
            total = 100;
        }
        this.rage = total;
    }
    addRage(dmg, result, weapon, spell) {
        let oldRage = this.rage;
        let gainedBefore = this.ragegained;
        let hand = weapon && weapon.offhand ? 'Off Hand' : 'Main Hand';
        let resname = result == RESULT.CRIT ? 'Crit' : result == RESULT.GLANCE ? 'Glance' : result == RESULT.DODGE ? 'Dodge' : result == RESULT.MISS ? 'Miss' : 'Hit';
        // Unbridled Wrath. Classic mechanics: white swings and Heroic Strike/Cleave. Forever mechanics: white swings only.
        if (this.talents.umbridledwrath && result != RESULT.MISS && result != RESULT.DODGE &&
            (!spell || (this.uwcfg.mech != 'forever' && (spell instanceof HeroicStrike || spell instanceof Cleave))) &&
            rng10k() < this.foreverUW() * 100)
            this.gainRage(1, 'Unbridled Wrath', spell ? spell.name : hand + ' auto attack');
        if (spell) {
            if (spell instanceof Execute) spell.result = result;
            if (result == RESULT.MISS || result == RESULT.DODGE) {
                if (spell instanceof Execute) {
                    // RAGE NORM (build 15, as ForeverSim): a missed/dodged Execute still consumes all remaining rage,
                    // then refunds 84% of (base cost + the extra rage it consumed).
                    const extra = Math.max(this.rage, 0);
                    if (extra > 0) this.spendRage(extra, spell.name, true);
                    this.gainRage((spell.cost + extra) * 0.84, 'Ability Refunds (Execute: 84% of cost + extra rage)', spell.name + ' (' + resname + ')');
                }
                else if (spell.refund && !(this.rmhs == 'forever' && spell instanceof HeroicStrike))
                    this.gainRage(spell.cost * 0.8, 'Ability Refunds (80% of cost)', spell.name + ' (' + resname + ')');
                oldRage += (spell.cost || 0) + (spell.usedrage || 0); // prevent cbr proccing on refunds
            }
        }
        else {
            const wf = !weapon.offhand && this.wfswing;
            const label = hand + (wf ? ' Windfury' : '') + ' (' + resname + ')';
            if (this.forever) {
                // FOREVER: misses and dodges give nothing; a landed swing gives rate x weapon speed, whatever its damage
                if (result != RESULT.MISS && result != RESULT.DODGE) this.gainRage(this.foreverRage(weapon, result == RESULT.CRIT), 'Auto Attacks', label);
            }
            else if (result == RESULT.DODGE) {
                // RAGE NORM: "Rage on miss/dodge auto" = Forever gives no rage for a dodged white swing
                if (this.rmauto == 'forever') { }
                else if (this.ragenorm) this.gainRage(0.75 * this.normRage(weapon.avgdmg(), weapon, false, wf), 'Auto Attacks', label);
                else this.gainRage((weapon.avgdmg() / this.rageconversion) * 7.5 * 0.75, 'Auto Attacks', label);
            }
            else if (result != RESULT.MISS) {
                if (this.ragenorm) this.gainRage(this.normRage(dmg, weapon, result == RESULT.CRIT, wf), 'Auto Attacks', label);
                else this.gainRage((dmg / this.rageconversion) * 7.5 * this.ragemod, 'Auto Attacks', label);
            }
        }
        if (this.extrarage && result == RESULT.HIT) this.gainRage(this.extrarage, 'Frenzied Assault', (spell ? spell.name : hand + ' auto attack') + ' (Hit)');
        if (this.extracritrage && result == RESULT.CRIT) this.gainRage(this.extracritrage, 'Frenzied Assault', (spell ? spell.name : hand + ' auto attack') + ' (Crit)');

        if ((spell instanceof HeroicStrike || spell instanceof Cleave) && result != RESULT.MISS && result != RESULT.DODGE)
            this.hsoppEntry(spell.name).selfrage += this.ragegained - gainedBefore;
        if (this.auras.consumedrage && oldRage < 60 && this.rage >= 60)
            this.auras.consumedrage.use();
    }
    // RAGE NORM: rage from one white hit (or the average swing behind a dodge).
    // L = Classic rage of the hit. t = weapon's current (hasted) swing time.
    // Threshold D0 = k * t and cap C = cap * t (off hand x oh, crit x2 on both).
    // Classic rage up to D0, then R = R0 + x / (1 + (x / (C - R0))^p)^(1/p), x = L - R0.
    // Windfury extra-attack swings get x wf.
    normRage(dmg, weapon, crit, wf) {
        const n = this.ragenorm;
        // Curved + modified Classic: the Classic part uses coefficient n.coef instead of 7.5 (threshold damage k unchanged, cap unchanged)
        const s = (n.modc ? n.coef : 7.5) * this.ragemod / this.rageconversion;
        const L = Math.max(dmg, 0) * s;
        const t = weapon.speed / this.stats.haste;
        const f = (weapon.offhand ? n.oh : 1) * (crit ? 2 : 1);
        const R0 = s * n.k * t * f;
        let C = n.cap * t * f;
        // RAGE NORM table cap: shrink the cap when this hand's white attack table is stronger than the reference
        if (n.tablecap) {
            const M = this.whiteTableM(weapon);
            const Mref = weapon.offhand ? n.mrefoh : n.mrefmh;
            if (M > Mref) C *= Mref / M;
        }
        let r;
        if (L <= R0) r = L;
        else if (C <= R0) r = Math.min(L, C);
        else {
            const x = L - R0;
            r = R0 + x / Math.pow(1 + Math.pow(x / (C - R0), n.p), 1 / n.p);
        }
        return wf ? r * n.wf : r;
    }
    // FOREVER: rage from one landed white swing = rate x listed weapon speed (haste does not shrink it).
    // Rates from Marrow's compendium: 3.46 main hand, 1.73 off hand, 4.5 two-hander.
    // Off-hand multiplier from Dual Wield Specialization (scaled by points): v0 x2, v1 x1, v2 x1.5. Crit: v0 x1, v1 x1.75, v2 x2.
    foreverRage(weapon, crit) {
        const v = this.forever.ver;
        const rate = weapon.twohand ? 4.5 : weapon.offhand ? 1.73 : 3.46;
        const pts = (this.talents.offmod || 0) / 0.25;
        const ohm = weapon.offhand ? 1 + ([1, 0, 0.5][v]) * pts : 1;
        const cm = crit ? [1, 1.75, 2][v] : 1;
        return rate * weapon.speed * ohm * cm;
    }
    // FOREVER: Unbridled Wrath proc chance in %, scaled from the 5/5 value (60 = fixed tooltip, 36 = beta bug)
    foreverUW() {
        return this.talents.umbridledwrath / 40 * this.uwcfg.pct;
    }
    // RAGE NORM: white attack-table strength M = P(hit) + 2 P(crit) + P(glance) + 0.75 P(dodge).
    // Crit from Recklessness and Elune's Light is left out, so those cooldowns still raise rage while active.
    whiteTableM(weapon) {
        const pMiss = Math.max(this.oh ? weapon.dwmiss : weapon.miss, 0) / 100;
        const pDodge = Math.max(weapon.dodge, 0) / 100;
        const pGlance = Math.max(weapon.glanceChance, 0) / 100;
        const pRemain = Math.max(1 - pMiss - pDodge - pGlance, 0);
        let excluded = 0;
        const rk = this.auras.recklessness;
        if (rk && rk.timer && rk.stats) excluded += rk.stats.crit || 0;
        const el = this.auras.eluneslight;
        if (el && el.timer) excluded += (el.stats && el.stats.crit) || 10;
        const pCrit = Math.min(Math.max(this.crit + weapon.crit - excluded, 0) / 100, pRemain);
        const pHit = pRemain - pCrit;
        return pHit + 2 * pCrit + pGlance + 0.75 * pDodge;
    }
    steptimer(a) {
        if (this.timer <= a) {
            this.timer = 0;
            /* start-log */ if (this.logging) this.log('Global CD off'); /* end-log */
            return true;
        }
        else {
            this.timer -= a;
            return false;
        }
    }
    stepitemtimer(a) {
        if (this.itemtimer <= a) {
            this.itemtimer = 0;
            /* start-log */ if (this.logging) this.log('Item CD off'); /* end-log */
            return true;
        }
        else {
            this.itemtimer -= a;
            return false;
        }
    }
    stepstancetimer(a) {
        if (this.stancetimer <= a) {
            this.stancetimer = 0;
            /* start-log */ if (this.logging) this.log('Stance CD off'); /* end-log */
            return true;
        }
        else {
            this.stancetimer -= a;
            return false;
        }
    }
    stepragetimer(a) {
        if (this.ragetimer <= a) {
            this.ragetimer = 0;
            this.gainRage(10, 'Stance Switch', '', true);
            /* start-log */ if (this.logging) this.log('10 rage gained'); /* end-log */
            return true;
        }
        else {
            this.ragetimer -= a;
            return false;
        }
    }
    stepdodgetimer(a) {
        if (this.dodgetimer <= a) {
            this.dodgetimer = 0;
        }
        else {
            this.dodgetimer -= a;
        }
    }
    stepauras(nobleeds) {

        if (this.mh.proc1 && this.mh.proc1.spell && this.mh.proc1.spell.timer) this.mh.proc1.spell.step();
        if (this.mh.proc2 && this.mh.proc2.spell && this.mh.proc2.spell.timer) this.mh.proc2.spell.step();
        if (this.oh && this.oh.proc1 && this.oh.proc1.spell && this.oh.proc1.spell.timer) this.oh.proc1.spell.step();
        if (this.oh && this.oh.proc2 && this.oh.proc2.spell && this.oh.proc2.spell.timer) this.oh.proc2.spell.step();

        if (this.auras.mightyragepotion && this.auras.mightyragepotion.firstuse && this.auras.mightyragepotion.timer) this.auras.mightyragepotion.step();
        if (this.auras.mildlyirradiated && this.auras.mildlyirradiated.firstuse && this.auras.mildlyirradiated.timer) this.auras.mildlyirradiated.step();
        if (this.auras.recklessness && this.auras.recklessness.firstuse && this.auras.recklessness.timer) this.auras.recklessness.step();
        if (this.auras.deathwish && this.auras.deathwish.firstuse && this.auras.deathwish.timer) this.auras.deathwish.step();
        if (this.auras.cloudkeeper && this.auras.cloudkeeper.firstuse && this.auras.cloudkeeper.timer) this.auras.cloudkeeper.step();
        if (this.auras.voidmadness && this.auras.voidmadness.firstuse && this.auras.voidmadness.timer) this.auras.voidmadness.step();
        if (this.auras.gyromaticacceleration && this.auras.gyromaticacceleration.firstuse && this.auras.gyromaticacceleration.timer) this.auras.gyromaticacceleration.step();
        if (this.auras.gneurological && this.auras.gneurological.firstuse && this.auras.gneurological.timer) this.auras.gneurological.step();
        if (this.auras.coinflip && this.auras.coinflip.timer) this.auras.coinflip.step();
        if (this.auras.flask && this.auras.flask.firstuse && this.auras.flask.timer) this.auras.flask.step();
        if (this.auras.bloodfury && this.auras.bloodfury.firstuse && this.auras.bloodfury.timer) this.auras.bloodfury.step();
        if (this.auras.berserking && this.auras.berserking.firstuse && this.auras.berserking.timer) this.auras.berserking.step();
        if (this.auras.slayer && this.auras.slayer.firstuse && this.auras.slayer.timer) this.auras.slayer.step();
        if (this.auras.spider && this.auras.spider.firstuse && this.auras.spider.timer) this.auras.spider.step();
        if (this.auras.earthstrike && this.auras.earthstrike.firstuse && this.auras.earthstrike.timer) this.auras.earthstrike.step();
        if (this.auras.roarguardian && this.auras.roarguardian.firstuse && this.auras.roarguardian.timer) this.auras.roarguardian.step();
        if (this.auras.pummeler && this.auras.pummeler.firstuse && this.auras.pummeler.timer) this.auras.pummeler.step();
        if (this.auras.swarmguard && this.auras.swarmguard.firstuse && this.auras.swarmguard.timer) this.auras.swarmguard.step();
        if (this.auras.zandalarian && this.auras.zandalarian.firstuse && this.auras.zandalarian.timer) this.auras.zandalarian.step();
        if (this.auras.relentlessstrength && this.auras.relentlessstrength.firstuse && this.auras.relentlessstrength.timer) this.auras.relentlessstrength.step();
        if (this.auras.rampage && this.auras.rampage.timer) this.auras.rampage.step();
        if (this.auras.wreckingcrew && this.auras.wreckingcrew.timer) this.auras.wreckingcrew.step();
        if (this.auras.freshmeat && this.auras.freshmeat.timer) this.auras.freshmeat.step();
        if (this.auras.suddendeath && this.auras.suddendeath.timer) this.auras.suddendeath.step();
        if (this.auras.voodoofrenzy && this.auras.voodoofrenzy.timer) this.auras.voodoofrenzy.step();
        if (this.auras.battleshout && this.auras.battleshout.timer) this.auras.battleshout.step();
        if (this.auras.echoeszerk && this.auras.echoeszerk.timer) this.auras.echoeszerk.step();
        if (this.auras.echoesbattle && this.auras.echoesbattle.timer) this.auras.echoesbattle.step();
        if (this.auras.echoesdef && this.auras.echoesdef.timer) this.auras.echoesdef.step();
        if (this.auras.echoesglad && this.auras.echoesglad.timer) this.auras.echoesglad.step();
        if (this.auras.battleforecast && this.auras.battleforecast.timer) this.auras.battleforecast.step();
        if (this.auras.zerkforecast && this.auras.zerkforecast.timer) this.auras.zerkforecast.step();
        if (this.auras.defforecast && this.auras.defforecast.timer) this.auras.defforecast.step();
        if (this.auras.gladforecast && this.auras.gladforecast.timer) this.auras.gladforecast.step();
        if (this.auras.defendersresolve && this.auras.defendersresolve.timer) this.auras.defendersresolve.step();
        if (this.auras.singleminded && this.auras.singleminded.timer) this.auras.singleminded.step();
        if (this.auras.demontaintedblood && this.auras.demontaintedblood.timer) this.auras.demontaintedblood.step();
        if (this.auras.wrathwray && this.auras.wrathwray.timer) this.auras.wrathwray.step();
        if (this.auras.moonstalkerfury && this.auras.moonstalkerfury.timer) this.auras.moonstalkerfury.step();
        if (this.auras.jujuflurry && this.auras.jujuflurry.timer) this.auras.jujuflurry.step();
        if (this.auras.grilekguard && this.auras.grilekguard.timer) this.auras.grilekguard.step();
        if (this.auras.obsidianhaste && this.auras.obsidianhaste.timer) this.auras.obsidianhaste.step();
        if (this.auras.obsidianstrength && this.auras.obsidianstrength.timer) this.auras.obsidianstrength.step();

        if (this.mh.windfury && this.mh.windfury.timer) this.mh.windfury.step();
        if (this.trinketproc1 && this.trinketproc1.spell && this.trinketproc1.spell.timer) this.trinketproc1.spell.step();
        if (this.trinketproc2 && this.trinketproc2.spell && this.trinketproc2.spell.timer) this.trinketproc2.spell.step();
        if (this.attackproc1 && this.attackproc1.spell && this.attackproc1.spell.timer) this.attackproc1.spell.step();
        if (this.attackproc2 && this.attackproc2.spell && this.attackproc2.spell.timer) this.attackproc2.spell.step();

        if (!nobleeds && this.auras.deepwounds && this.auras.deepwounds.timer) this.auras.deepwounds.step();
        if (!nobleeds && this.auras.rend && this.auras.rend.timer) this.auras.rend.step();
        if (this.auras.berserkerrage && this.auras.berserkerrage.timer) this.auras.berserkerrage.step();
        if (this.auras.consumedrage && this.auras.consumedrage.timer) this.auras.consumedrage.step();
        if (this.auras.weaponbleedmh && this.auras.weaponbleedmh.timer) this.auras.weaponbleedmh.step();
        if (this.auras.weaponbleedoh && this.auras.weaponbleedoh.timer) this.auras.weaponbleedoh.step();

        if (!nobleeds && this.adjacent) {
            if (this.auras.deepwounds2 && this.auras.deepwounds2.timer) this.auras.deepwounds2.step();
            if (this.auras.deepwounds3 && this.auras.deepwounds3.timer) this.auras.deepwounds3.step();
            if (this.auras.deepwounds4 && this.auras.deepwounds4.timer) this.auras.deepwounds4.step();
        }
    }
    endauras() {

        if (this.mh.proc1 && this.mh.proc1.spell && this.mh.proc1.spell.timer) this.mh.proc1.spell.end();
        if (this.mh.proc2 && this.mh.proc2.spell && this.mh.proc2.spell.timer) this.mh.proc2.spell.end();
        if (this.oh && this.oh.proc1 && this.oh.proc1.spell && this.oh.proc1.spell.timer) this.oh.proc1.spell.end();
        if (this.oh && this.oh.proc2 && this.oh.proc2.spell && this.oh.proc2.spell.timer) this.oh.proc2.spell.end();

        if (this.auras.mightyragepotion && this.auras.mightyragepotion.firstuse && this.auras.mightyragepotion.timer) this.auras.mightyragepotion.end();
        if (this.auras.mildlyirradiated && this.auras.mildlyirradiated.firstuse && this.auras.mildlyirradiated.timer) this.auras.mildlyirradiated.end();
        if (this.auras.recklessness && this.auras.recklessness.firstuse && this.auras.recklessness.timer) this.auras.recklessness.end();
        if (this.auras.deathwish && this.auras.deathwish.firstuse && this.auras.deathwish.timer) this.auras.deathwish.end();
        if (this.auras.cloudkeeper && this.auras.cloudkeeper.firstuse && this.auras.cloudkeeper.timer) this.auras.cloudkeeper.end();
        if (this.auras.voidmadness && this.auras.voidmadness.firstuse && this.auras.voidmadness.timer) this.auras.voidmadness.end();
        if (this.auras.gyromaticacceleration && this.auras.gyromaticacceleration.firstuse && this.auras.gyromaticacceleration.timer) this.auras.gyromaticacceleration.end();
        if (this.auras.gneurological && this.auras.gneurological.firstuse && this.auras.gneurological.timer) this.auras.gneurological.end();
        if (this.auras.coinflip && this.auras.coinflip.timer) this.auras.coinflip.end();
        if (this.auras.flask && this.auras.flask.firstuse && this.auras.flask.timer) this.auras.flask.end();
        if (this.auras.bloodfury && this.auras.bloodfury.firstuse && this.auras.bloodfury.timer) this.auras.bloodfury.end();
        if (this.auras.berserking && this.auras.berserking.firstuse && this.auras.berserking.timer) this.auras.berserking.end();
        if (this.auras.slayer && this.auras.slayer.firstuse && this.auras.slayer.timer) this.auras.slayer.end();
        if (this.auras.spider && this.auras.spider.firstuse && this.auras.spider.timer) this.auras.spider.end();
        if (this.auras.gabbar && this.auras.gabbar.firstuse && this.auras.gabbar.timer) this.auras.gabbar.end();
        if (this.auras.earthstrike && this.auras.earthstrike.firstuse && this.auras.earthstrike.timer) this.auras.earthstrike.end();
        if (this.auras.roarguardian && this.auras.roarguardian.firstuse && this.auras.roarguardian.timer) this.auras.roarguardian.end();
        if (this.auras.pummeler && this.auras.pummeler.firstuse && this.auras.pummeler.timer) this.auras.pummeler.end();
        if (this.auras.swarmguard && this.auras.swarmguard.firstuse && this.auras.swarmguard.timer) this.auras.swarmguard.end();
        if (this.auras.zandalarian && this.auras.zandalarian.firstuse && this.auras.zandalarian.timer) this.auras.zandalarian.end();
        if (this.auras.relentlessstrength && this.auras.relentlessstrength.firstuse && this.auras.relentlessstrength.timer) this.auras.relentlessstrength.end();
        if (this.auras.rampage && this.auras.rampage.timer) this.auras.rampage.end();
        if (this.auras.wreckingcrew && this.auras.wreckingcrew.timer) this.auras.wreckingcrew.end();
        if (this.auras.freshmeat && this.auras.freshmeat.timer) this.auras.freshmeat.end();
        if (this.auras.suddendeath && this.auras.suddendeath.timer) this.auras.suddendeath.end();
        if (this.auras.voodoofrenzy && this.auras.voodoofrenzy.timer) this.auras.voodoofrenzy.end();
        if (this.auras.battleshout && this.auras.battleshout.timer) this.auras.battleshout.end();
        if (this.auras.echoeszerk && this.auras.echoeszerk.timer) this.auras.echoeszerk.end();
        if (this.auras.echoesbattle && this.auras.echoesbattle.timer) this.auras.echoesbattle.end();
        if (this.auras.echoesdef && this.auras.echoesdef.timer) this.auras.echoesdef.end();
        if (this.auras.echoesglad && this.auras.echoesglad.timer) this.auras.echoesglad.end();
        if (this.auras.battleforecast && this.auras.battleforecast.timer) this.auras.battleforecast.end();
        if (this.auras.zerkforecast && this.auras.zerkforecast.timer) this.auras.zerkforecast.end();
        if (this.auras.defforecast && this.auras.defforecast.timer) this.auras.defforecast.end();
        if (this.auras.gladforecast && this.auras.gladforecast.timer) this.auras.gladforecast.end();
        if (this.auras.defendersresolve && this.auras.defendersresolve.timer) this.auras.defendersresolve.end();
        if (this.auras.singleminded && this.auras.singleminded.timer) this.auras.singleminded.end();
        if (this.auras.moonstalkerfury && this.auras.moonstalkerfury.timer) this.auras.moonstalkerfury.end();
        if (this.auras.demontaintedblood && this.auras.demontaintedblood.timer) this.auras.demontaintedblood.end();
        if (this.auras.wrathwray && this.auras.wrathwray.timer) this.auras.wrathwray.end();
        if (this.auras.jujuflurry && this.auras.jujuflurry.timer) this.auras.jujuflurry.end();
        if (this.auras.grilekguard && this.auras.grilekguard.timer) this.auras.grilekguard.end();
        if (this.auras.obsidianhaste && this.auras.obsidianhaste.timer) this.auras.obsidianhaste.end();
        if (this.auras.obsidianstrength && this.auras.obsidianstrength.timer) this.auras.obsidianstrength.end();
        

        if (this.mh.windfury && this.mh.windfury.timer) this.mh.windfury.end();
        if (this.trinketproc1 && this.trinketproc1.spell && this.trinketproc1.spell.timer) this.trinketproc1.spell.end();
        if (this.trinketproc2 && this.trinketproc2.spell && this.trinketproc2.spell.timer) this.trinketproc2.spell.end();
        if (this.attackproc1 && this.attackproc1.spell && this.attackproc1.spell.timer) this.attackproc1.spell.end();
        if (this.attackproc2 && this.attackproc2.spell && this.attackproc2.spell.timer) this.attackproc2.spell.end();

        if (this.auras.flurry && this.auras.flurry.timer) this.auras.flurry.end();
        if (this.auras.deepwounds && this.auras.deepwounds.timer) this.auras.deepwounds.end();
        if (this.auras.deepwounds2 && this.auras.deepwounds2.timer) this.auras.deepwounds2.end();
        if (this.auras.deepwounds3 && this.auras.deepwounds3.timer) this.auras.deepwounds3.end();
        if (this.auras.deepwounds4 && this.auras.deepwounds4.timer) this.auras.deepwounds4.end();
        if (this.auras.rend && this.auras.rend.timer) this.auras.rend.end();
        if (this.auras.berserkerrage && this.auras.berserkerrage.timer) this.auras.berserkerrage.end();
        if (this.auras.consumedrage && this.auras.consumedrage.timer) this.auras.consumedrage.end();
        if (this.auras.weaponbleedmh && this.auras.weaponbleedmh.timer) this.auras.weaponbleedmh.end();
        if (this.auras.weaponbleedoh && this.auras.weaponbleedoh.timer) this.auras.weaponbleedoh.end();
        

    }
    rollweapon(weapon) {
        let tmp = 0;
        let roll = rng10k();
        tmp += Math.max(this.nextswinghs && this.hsmech != 'forever' ? weapon.miss : weapon.dwmiss, 0) * 100;
        if (roll < tmp) return RESULT.MISS;
        tmp += weapon.dodge * 100;
        if (roll < tmp) return RESULT.DODGE;
        tmp += weapon.glanceChance * 100;
        if (roll < tmp) return RESULT.GLANCE;
        tmp += (this.crit + weapon.crit) * 100;
        if (roll < tmp) return RESULT.CRIT;
        return RESULT.HIT;
    }
    rollmeleespell(spell, weapon) {
        if (!weapon) weapon = this.mh;
        let tmp = 0;
        let roll = rng10k();
        tmp += Math.max(weapon.miss, 0) * 100;
        if (roll < tmp) return RESULT.MISS;
        if (spell.canDodge) {
            tmp += weapon.dodge * 100;
            if (roll < tmp) return RESULT.DODGE;
        }
        if (!spell.weaponspell) {
            roll = rng10k();
            tmp = 0;
        }
        let crit = this.crit + weapon.crit;
        if (spell instanceof Overpower)
            crit += this.talents.overpowercrit;
        tmp += crit * 100;
        if (roll < tmp && !spell.nocrit) return RESULT.CRIT;
        return RESULT.HIT;
    }
    rollmagicspell(spell) {
        let miss = this.target.misschance;
        if (spell.binaryspell) 
            miss = this.target.binaryresist;

        if (rng10k() < miss) 
            return RESULT.MISS;
        if (rng10k() < (this.stats.spellcrit * 100)) 
            return RESULT.CRIT;
        return RESULT.HIT;
    }
    // Deducts rage and records it per ability for the Rage Spent stats.
    // extra = true adds rage without counting a new cast (Execute consuming its remaining rage).
    spendRage(amount, name, extra) {
        this.rage -= amount;
        if (!(amount > 0)) return;
        let e = this.ragespent[name] || (this.ragespent[name] = { n: 0, rage: 0, extra: 0 });
        if (extra) e.extra += amount;
        else { e.n++; e.rage += amount; }
    }
    // Heroic Strike / Cleave opportunity cost: a queued HS/Cleave replaces the main hand white swing,
    // so the rage that swing would have generated is lost. Records cost paid and the expected forgone white rage.
    hsoppEntry(name) {
        return this.hsopp[name] || (this.hsopp[name] = { n: 0, spent: 0, forgone: 0, forgonedmg: 0, selfrage: 0, ohswings: 0, ohrage: 0, ohdmg: 0, wfprocs: 0, wfdmg: 0, wfrage: 0 });
    }
    trackReplacedSwing(spell, weapon, cost) {
        let e = this.hsoppEntry(spell.name);
        let w = this.expectedWhite(weapon, undefined, 0, this.wfswing);
        e.n++;
        e.spent += cost;
        e.forgone += w.rage;
        e.forgonedmg += w.dmg;
        // Windfury Totem: 20% on a landed main hand attack (not miss/dodge) while Windfury is not already active.
        // HS/Cleave have no dual wield miss penalty, so they land (and proc Windfury) more often than the
        // replaced white swing. Credit the expected extra procs, each worth one extra main hand white attack
        // with the Windfury AP bonus.
        let wf = this.auras.windfury;
        if (this.mh.windfury && wf && !wf.timer) {
            const dodge = Math.max(weapon.dodge, 0) / 100;
            const landWhite = Math.max(1 - Math.max(weapon.dwmiss, 0) / 100 - dodge, 0);
            const landSpell = Math.max(1 - Math.max(weapon.miss, 0) / 100 - (spell.canDodge ? dodge : 0), 0);
            const extra = 0.2 * (landSpell - landWhite);
            if (extra) {
                let wfap = 0;
                if (wf.stats && wf.stats.ap) wfap += wf.stats.ap * this.stats.apmod;
                if (wf.mult_stats && wf.mult_stats.apmod) wfap += this.stats.ap * wf.mult_stats.apmod / 100;
                const a = this.expectedWhite(this.mh, this.mh.dwmiss, wfap, true);
                e.wfprocs += extra;
                e.wfdmg += extra * a.dmg;
                e.wfrage += extra * a.rage;
            }
        }
    }
    // Expected damage and rage from one white swing with this weapon, using the same attack table as rollweapon()
    // (dual wield miss, dodge, glance, crit) and the same rage formula as addRage(). It is an expected value,
    // so it does not consume the sim's RNG and leaves DPS results unchanged. Includes Unbridled Wrath
    // and Frenzied Assault flat hit/crit rage. miss overrides the miss chance (default: dual wield miss).
    expectedWhite(weapon, miss, apbonus, wf) {
        const pMiss = Math.max(miss === undefined ? weapon.dwmiss : miss, 0) / 100;
        const pDodge = Math.max(weapon.dodge, 0) / 100;
        const pGlance = Math.max(weapon.glanceChance, 0) / 100;
        const pRemain = Math.max(1 - pMiss - pDodge - pGlance, 0);
        const pCrit = Math.min(Math.max(this.crit + weapon.crit, 0) / 100, pRemain);
        const pHit = pRemain - pCrit;

        let avg = (weapon.mindmg + weapon.maxdmg) / 2 + weapon.bonusdmg + ((this.stats.ap + (apbonus || 0)) / 14) * weapon.speed + this.stats.moddmgdone;
        avg = (avg * weapon.modifier * this.stats.dmgmod + this.stats.moddmgtaken) * (1 - this.armorReduction);

        const diff = this.target.defense - this.stats['skill_' + weapon.type];
        const glow = Math.max(Math.min(1.3 - 0.05 * diff, 0.91), 0.01);
        const ghigh = Math.max(Math.min(1.2 - 0.03 * diff, 0.99), 0.2);
        const glanceMod = (glow + ghigh) / 2;
        const critMod = 1 + 1 * (1 + this.critdmgbonus * 2);

        const perDmg = 7.5 * this.ragemod / this.rageconversion;
        const dmg = pHit * avg + pGlance * avg * glanceMod + pCrit * avg * critMod;
        let rage;
        if (this.forever) {
            rage = (pHit + pGlance) * this.foreverRage(weapon, false) + pCrit * this.foreverRage(weapon, true);
        }
        else if (this.ragenorm) {
            // RAGE NORM: apply the curve to each outcome's average damage
            rage = pHit * this.normRage(avg, weapon, false, wf) + pGlance * this.normRage(avg * glanceMod, weapon, false, wf)
                + pCrit * this.normRage(avg * critMod, weapon, true, wf) + (this.rmauto == 'forever' ? 0 : pDodge * 0.75 * this.normRage(weapon.avgdmg(), weapon, false, wf));
        }
        else {
            rage = dmg * perDmg;
            if (this.rmauto != 'forever') rage += pDodge * (weapon.avgdmg() / this.rageconversion) * 7.5 * 0.75;
        }
        if (this.extrarage) rage += pHit * this.extrarage;
        if (this.extracritrage) rage += pCrit * this.extracritrage;
        // Unbridled Wrath: 1 rage on any swing that is not a miss or dodge
        if (this.talents.umbridledwrath) rage += (1 - pMiss - pDodge) * this.foreverUW() / 100;
        return { rage, dmg };
    }
    attackmh(weapon, adjacent, damageSoFar) {
        this.stepauras();

        let spell = null;
        let procdmg = 0;
        let result;

        if (this.nextswinghs) {
            this.nextswinghs = false;
            if (this.spells.heroicstrike && this.spells.heroicstrike.cost <= this.rage) {
                result = this.rollmeleespell(this.spells.heroicstrike);
                spell = this.spells.heroicstrike;
                this.spendRage(spell.cost, spell.name);
                if (!adjacent) this.trackReplacedSwing(spell, weapon, spell.cost);
            }
            else if (this.spells.cleave && this.spells.cleave.cost <= this.rage) {
                result = this.rollmeleespell(this.spells.cleave);
                spell = this.spells.cleave;
                if (adjacent) {
                    this.spendRage(spell.cost, spell.name);
                    if (this.hsopp[spell.name]) this.hsopp[spell.name].spent += spell.cost;
                }
                else this.trackReplacedSwing(spell, weapon, 0);
            }
            else {
                result = this.rollweapon(weapon);
                /* start-log */ if (this.logging) this.log(`Heroic Strike auto canceled`); /* end-log */
            }
        }
        else {
            result = this.rollweapon(weapon);
        }
        if (spell && this.spells.ragingblow)
            this.spells.ragingblow.reduce(spell);

        let dmg = weapon.dmg(spell);
        procdmg = this.procattack(spell, weapon, result, adjacent, damageSoFar);

        if (result == RESULT.DODGE) {
            this.dodgetimer = 5000;
        }
        if (result == RESULT.GLANCE) {
            dmg *= this.getGlanceReduction(weapon);
        }
        if (result == RESULT.CRIT) {
            // 100% + baseCritDamage * (1 + CritStrikeDamageBonus) * (1 + IncreasedCritDamage * (1 + 100%/baseCritDamage))
            let critmod = 1 + 1 * (1 + (spell ? this.talents.abilitiescrit : 0)) * (1 + this.critdmgbonus * 2)
            dmg *= critmod;
            this.proccrit(false, adjacent);
        }

        weapon.use();
        let done = this.dealdamage(dmg, result, weapon, spell, adjacent);
        if (spell) {
            spell.totaldmg += done;
            if (!adjacent) spell.data[result]++;
        }
        else {
            weapon.totaldmg += done;
            weapon.data[result]++;
            if (this.wfswing) { weapon.resdmgwf[result] += done; weapon.resnwf[result]++; }
            else { weapon.resdmg[result] += done; weapon.resn[result]++; }
        }
        weapon.totalprocdmg += procdmg;
        /* start-log */ if (this.logging) this.log(`${spell ? spell.name + ' for' : 'Main hand attack for'} ${~~done} (${Object.keys(RESULT)[result]})${adjacent ? ' (Adjacent)' : ''}`); /* end-log */

        if (spell instanceof Cleave && !adjacent) {
            this.nextswinghs = true;
            done += this.attackmh(weapon, 1, done);
        }
        return done + procdmg;
    }
    attackoh(weapon) {
        this.stepauras();

        let procdmg = 0;
        let result;
        if (this.nextswinghs && this.hsmech != 'forever' && this.queuedswing && weapon.dwmiss > weapon.miss) {
            // Queued HS/Cleave removes the dual wield miss penalty from off hand swings (see rollweapon).
            // Credit the expected extra off hand damage and rage to the queued ability.
            let e = this.hsoppEntry(this.queuedswing.name);
            let q = this.expectedWhite(weapon, weapon.miss), d = this.expectedWhite(weapon, weapon.dwmiss);
            e.ohswings++;
            e.ohdmg += q.dmg - d.dmg;
            e.ohrage += q.rage - d.rage;
        }
        result = this.rollweapon(weapon);

        let dmg = weapon.dmg();
        procdmg = this.procattack(null, weapon, result);

        if (result == RESULT.DODGE) {
            this.dodgetimer = 5000;
        }
        if (result == RESULT.GLANCE) {
            dmg *= this.getGlanceReduction(weapon);
        }
        if (result == RESULT.CRIT) {
            let critmod = 1 + 1 * (1 + this.critdmgbonus * 2)
            dmg *= critmod;
            this.proccrit(true);
        }

        weapon.use();
        let done = this.dealdamage(dmg, result, weapon);
        weapon.data[result]++;
        weapon.resdmg[result] += done; weapon.resn[result]++;
        weapon.totaldmg += done;
        weapon.totalprocdmg += procdmg;
        /* start-log */ if (this.logging) this.log(`Off hand attack for ${done + procdmg} (${Object.keys(RESULT)[result]})${this.nextswinghs ? ' (HS queued)' : ''}`); /* end-log */
        return done + procdmg;
    }
    cast(spell, delayedheroic, adjacent, damageSoFar) {
        if (!adjacent) {
            this.stepauras();
            spell.use(delayedheroic);
        }
        if (spell.useonly) {
            /* start-log */ if (this.logging) this.log(`${spell.name} used`); /* end-log */
            return 0;
        }
        if (this.spells.ragingblow) this.spells.ragingblow.reduce(spell);
        
        let dmg = spell.dmg() * this.mh.modifier;
        if (dmg) dmg += this.stats.moddmgtaken;
        let result;
        if (spell.defenseType == DEFENSETYPE.MELEE) 
            result = this.rollmeleespell(spell);
        else if(spell.defenseType == DEFENSETYPE.MAGIC)
            result = this.rollmagicspell(spell);
        else
            result = RESULT.HIT;

        let procdmg = this.procattack(spell, this.mh, result, adjacent, damageSoFar);
        if (spell instanceof SunderArmor) {
            procdmg += this.procattack(spell, this.mh, result, adjacent, damageSoFar);
        }

        if (result == RESULT.MISS) {
            spell.failed();
        }
        else if (result == RESULT.DODGE) {
            spell.failed();
            this.dodgetimer = 5000;
        }
        else if (result == RESULT.CRIT) {
            let critmod;
            if (spell.defenseType == DEFENSETYPE.MAGIC) 
                critmod = 1 + 0.5 * (1 + this.talents.abilitiescrit) * (1 + this.critdmgbonus * 3);
            else
                critmod = 1 + 1 * (1 + this.talents.abilitiescrit) * (1 + this.critdmgbonus * 2);

            dmg *= critmod;
            this.proccrit(false, adjacent, spell);
        }

        let done = this.dealdamage(dmg, result, this.mh, spell, adjacent);
        if (!adjacent) spell.data[result]++;
        spell.totaldmg += done;
        this.mh.totalprocdmg += procdmg;
        /* start-log */ if (this.logging) this.log(`${spell.name} for ${~~done} (${Object.keys(RESULT)[result]})${adjacent ? ' (Adjacent)' : ''}.`); /* end-log */
        return done + procdmg;
    }
    castoh(spell, adjacent, damageSoFar) {
        let dmg = spell.dmg(this.oh) * this.oh.modifier;
        if (dmg) dmg += this.stats.moddmgtaken;
        let result = this.rollmeleespell(spell, this.oh);

        let procdmg = this.procattack(spell, this.oh, result, adjacent, damageSoFar);
        if (result == RESULT.MISS) {
            spell.failed();
        }
        else if (result == RESULT.DODGE) {
            spell.failed();
            this.dodgetimer = 5000;
        }
        else if (result == RESULT.CRIT) {
            let critmod = 1 + 1 * (1 + this.talents.abilitiescrit) * (1 + this.critdmgbonus * 2);
            dmg *= critmod;
            this.proccrit(false, adjacent, spell);
        }

        let done = this.dealdamage(dmg, result, this.oh, spell, adjacent);
        spell.totaldmg += done;
        spell.offhandhit = false;
        this.oh.totalprocdmg += procdmg;
        /* start-log */ if (this.logging) this.log(`${spell.name} (OH) for ${~~done} (${Object.keys(RESULT)[result]})${adjacent ? ' (Adjacent)' : ''}.`); /* end-log */
        return done + procdmg;
    }
    dealdamage(dmg, result, weapon, spell, adjacent) {
        if (result != RESULT.MISS && result != RESULT.DODGE) {
            if(spell == null || spell.school == SCHOOL.PHYSICAL)
              dmg *= (1 - this.armorReduction);
            if (!adjacent) this.addRage(dmg, result, weapon, spell);
            return dmg;
        }
        else {
            if (!adjacent) this.addRage(dmg, result, weapon, spell);
            return 0;
        }
    }
    proccrit(offhand, adjacent, spell) {
        this.crittimer = 1;
        if (this.auras.flurry) this.auras.flurry.use();
        if (this.auras.deepwounds) {
            if (!adjacent) this.auras.deepwounds.use(offhand);
            else this.auras['deepwounds' + (~~rng(1,adjacent) + 1)].use(offhand);
        }
        if (this.auras.wreckingcrew) this.auras.wreckingcrew.use();
        if (this.overpowerrend && this.auras.rend && this.auras.rend.timer && spell instanceof Overpower) this.auras.rend.refresh();
    }
    procattack(spell, weapon, result, adjacent, damageSoFar) {
        let procdmg = 0;
        let extras = 0;
        let batchedextras = 0;
        if (spell instanceof ThunderClap) return 0;
        if (spell instanceof ShieldSlam) {
            if (result != RESULT.MISS && result != RESULT.DODGE) {
                if (this.mode == "sod") this.auras.defendersresolve.use();

                // procs at least windfury - more info needed
                if (weapon.windfury && !this.auras.windfury.timer && !damageSoFar && rng10k() < 2000) {
                    weapon.windfury.use();
                }
            }
            return 0;
        }
        if (result != RESULT.MISS && result != RESULT.DODGE) {
            if (spell instanceof Execute) {
                // Execute consumes all remaining rage (Sudden Death keeps 10). Record it as Execute's extra rage spent;
                // spendRage does the deduction, so rage ends at exactly 0 (or 10) as in the original sim.
                let execBefore = this.rage, execAfter = 0;
                if (this.auras.suddendeath && this.auras.suddendeath.timer) {
                    execAfter = 10;
                    this.auras.suddendeath.remove();
                }
                if (execBefore > execAfter) this.spendRage(execBefore - execAfter, spell.name, true);
                else if (execBefore < execAfter) this.gainRage(execAfter - execBefore, 'Sudden Death', '');
            }
            if (spell instanceof Slam && this.slammainreset) {
                if (this.spells.mortalstrike) this.spells.mortalstrike.timer = 0;
                if (this.spells.bloodthirst) this.spells.bloodthirst.timer = 0;
                if (this.spells.shieldslam) this.spells.shieldslam.timer = 0;
                /* start-log */ if (this.logging) this.log(`T2 Slam reset`); /* end-log */
            }
            if (weapon.proc1 && !weapon.proc1.extra && rng10k() < weapon.proc1.chance && !(weapon.proc1.gcd && this.timer && this.timer < 1500)) {
                if (weapon.proc1.spell) weapon.proc1.spell.use();
                if (weapon.proc1.magicdmg) procdmg += weapon.proc1.chance == 10000 ? weapon.proc1.magicdmg : this.magicproc(weapon.proc1);
                if (weapon.proc1.physdmg) {
                    let dmg = this.physproc(weapon.proc1.physdmg);
                    if (dmg > 0 && weapon.proc1.phantom) dmg += this.phantomproc(weapon)
                    procdmg += dmg
                }
                /* start-log */ if (this.logging) this.log(`${weapon.name} proc ${procdmg ? 'for ' + ~~procdmg : ''}`); /* end-log */
            }
            // Extra attacks roll only once per multi target attack
            if (weapon.proc1 && weapon.proc1.extra && !damageSoFar && rng10k() < weapon.proc1.chance && !(weapon.proc1.gcd && this.timer && this.timer < 1500)) {
                // Multiple extras procs off a non spel will only grant extra attack(s) from one source
                if (spell) this.extraattacks += weapon.proc1.extra;
                else extras = weapon.proc1.extra;
                /* start-log */ if (this.logging) this.log(`${weapon.name} proc ${procdmg ? 'for ' + ~~procdmg : ''}`); /* end-log */
            }
            if (weapon.proc2 && rng10k() < weapon.proc2.chance) {
                if (weapon.proc2.spell) weapon.proc2.spell.use();
                if (weapon.proc2.magicdmg) procdmg += this.magicproc(weapon.proc2);
                /* start-log */ if (this.logging) this.log(`${weapon.name} proc ${procdmg ? 'for ' + ~~procdmg : ''}`); /* end-log */
            }
            if (this.trinketproc1 && !this.trinketproc1.extra && rng10k() < this.trinketproc1.chance) {
                if (this.trinketproc1.magicdmg) procdmg += this.magicproc(this.trinketproc1);
                if (this.trinketproc1.spell) this.trinketproc1.spell.use();
                /* start-log */ if (this.logging) this.log(`Trinket 1 proc`); /* end-log */
            }
            if (this.trinketproc1 && this.trinketproc1.extra && !damageSoFar && rng10k() < this.trinketproc1.chance) {
                if (!this.trinketproc1.cooldown || !this.trinketproc1.usestep || step > this.trinketproc1.usestep) {
                    if (this.trinketproc1.cooldown) this.trinketproc1.usestep = step + this.trinketproc1.cooldown;
                    if (spell) this.batchedextras += this.trinketproc1.extra;
                    else batchedextras = this.trinketproc1.extra;
                    /* start-log */ if (this.logging) this.log(`Trinket 1 proc`); /* end-log */
                }
            }
            if (this.trinketproc2 && !this.trinketproc2.extra  && rng10k() < this.trinketproc2.chance) {
                if (this.trinketproc2.magicdmg) procdmg += this.magicproc(this.trinketproc2);
                if (this.trinketproc2.spell) this.trinketproc2.spell.use();
                /* start-log */ if (this.logging) this.log(`Trinket 2 proc`); /* end-log */
            }
            if (this.trinketproc2 && this.trinketproc2.extra && !damageSoFar && rng10k() < this.trinketproc2.chance) {
                if (!this.trinketproc2.cooldown || !this.trinketproc2.usestep || step > this.trinketproc2.usestep) {
                    if (this.trinketproc2.cooldown) this.trinketproc2.usestep = step + this.trinketproc2.cooldown;
                    if (spell) this.batchedextras += this.trinketproc2.extra;
                    else batchedextras = this.trinketproc2.extra;
                    /* start-log */ if (this.logging) this.log(`Trinket 2 proc`); /* end-log */
                }
            }
            if (this.attackproc1 && rng10k() < this.attackproc1.chance) {
                if (this.attackproc1.magicdmg) { 
                    procdmg += this.attackproc1.chance == 10000 ? this.attackproc1.magicdmg : this.magicproc(this.attackproc1);
                    /* start-log */ if (this.logging) this.log(`Attack proc for ${procdmg}`); /* end-log */
                }
                if (this.attackproc1.spell) this.attackproc1.spell.use();
            }
            if (this.attackproc2 && rng10k() < this.attackproc2.chance) {
                if (this.attackproc2.magicdmg) { 
                    procdmg += this.attackproc2.chance == 10000 ? this.attackproc2.magicdmg : this.magicproc(this.attackproc2);
                    /* start-log */ if (this.logging) this.log(`Attack proc for ${procdmg}`); /* end-log */
                }
                if (this.attackproc2.spell) this.attackproc2.spell.use();
            }
            // Sword spec shouldnt be able to proc itself
            if (this.talents.swordproc && weapon.type == WEAPONTYPE.SWORD && !damageSoFar && this.swordspecstep != step && rng10k() < this.talents.swordproc * 100) {
                this.swordspecstep = step;
                if (spell) this.extraattacks++;
                else extras++;
                /* start-log */ if (this.logging) this.log(`Sword talent proc`); /* end-log */
            }
            // Wailing set bonus extra
            if (this.wailingextra && !damageSoFar && this.wailingextrastep != step && rng10k() < 300) {
                this.wailingextrastep = step;
                if (spell) this.extraattacks++;
                else extras++;
                /* start-log */ if (this.logging) this.log(`Wailing set extra attack proc`); /* end-log */
            }
            // Hakkari set bonus extra
            if (this.hakkariextra && !damageSoFar && this.hakkariextrastep != step && rng10k() < 200) {
                this.hakkariextrastep = step;
                if (spell) this.extraattacks++;
                else extras++;
                /* start-log */ if (this.logging) this.log(`Hakkari set extra attack proc`); /* end-log */
            }
            // Timeworn extra
            if (this.timeworn && !damageSoFar && this.timewornstep != step && rng10k() < this.timeworn * 100) {
                this.timewornstep = step;
                if (spell) this.extraattacks++;
                else extras++;
                /* start-log */ if (this.logging) this.log(`Timeworn proc`); /* end-log */
            }
            // Obsidian Champion
            if (weapon.id == 233490 && rng10k() < weapon.proc1.chance && !(this.timer && this.timer < 1500)) {
                this.auras.obsidianstrength.use();
                /* start-log */ if (this.logging) this.log(`${weapon.name} Strength proc`); /* end-log */
            }
            if (weapon.id == 233490 && rng10k() < weapon.proc1.chance && !(this.timer && this.timer < 1500)) {
                this.auras.obsidianhaste.use();
                /* start-log */ if (this.logging) this.log(`${weapon.name} Haste proc`); /* end-log */
            }
            // Blood Surge
            if (this.bloodsurge && (spell instanceof Whirlwind || spell instanceof Bloodthirst || spell instanceof HeroicStrike || spell instanceof QuickStrike) && rng10k() < 3000) {
                this.freeslam = true;
                /* start-log */ if (this.logging) this.log(`Blood Surge proc`); /* end-log */
            }
            // Sword and Board
            if (this.swordboard && this.spells.shieldslam && (spell instanceof SunderArmor) && rng10k() < 3000) {
                this.freeshieldslam = true;
                this.spells.shieldslam.timer = 0;
                /* start-log */ if (this.logging) this.log(`Sword and Board proc`); /* end-log */
            }
            // Voodoo Frenzy
            if (this.auras.voodoofrenzy && rng10k() < 1500) {
                this.auras.voodoofrenzy.use();
            }
            // Sudden Death
            if (this.auras.suddendeath && rng10k() < 1000) {
                this.auras.suddendeath.use();
            }
            // Fresh Meat
            if (this.freshmeat && (spell instanceof Bloodthirst || spell instanceof MortalStrike || spell instanceof ShieldSlam) && (this.auras.freshmeat.firstuse || rng10k() < 1000)) {
                this.auras.freshmeat.use();
            }
            // Single Minded
            if (!spell && this.auras.singleminded) {
                this.auras.singleminded.use();
            }
            if (weapon.windfury && !this.auras.windfury.timer && !damageSoFar && rng10k() < 2000) {
                if (!spell) extras = 0;
                weapon.windfury.use();
            }
            if (this.auras.swarmguard && this.auras.swarmguard.timer && rng10k() < this.auras.swarmguard.chance) {
                this.auras.swarmguard.proc();
            }
            if (this.auras.zandalarian && this.auras.zandalarian.timer) {
                this.auras.zandalarian.proc();
            }
            if (this.auras.relentlessstrength && this.auras.relentlessstrength.timer) {
                this.auras.relentlessstrength.proc();
            }
            if (this.dragonbreath && rng10k() < 500) {
                procdmg += this.magicproc({ magicdmg: 60, coeff: 1 });
            }
            if (extras) this.extraattacks += extras;
            if (batchedextras) this.batchedextras += batchedextras;
        }
        if (!spell && this.auras.flurry && this.auras.flurry.stacks)
            this.auras.flurry.proc();
        if (!spell && this.mh.windfury && this.mh.windfury.stacks)
            this.mh.windfury.proc();
        return procdmg;
    }
    phantomproc(weapon) {
        let dmg = 0;
        if (rng10k() < weapon.proc1.chance) {
            dmg += this.physproc(weapon.proc1.physdmg);
            if (dmg > 0) dmg += this.phantomproc(weapon)
        }
        if (weapon.proc2 && rng10k() < weapon.proc2.chance) {
            if (weapon.proc2.spell) weapon.proc2.spell.use();
            if (weapon.proc2.magicdmg) dmg += this.magicproc(weapon.proc2);
            /* start-log */ if (this.logging) this.log(`${weapon.name} proc`); /* end-log */
        }
        return dmg;
    }
    magicproc(proc) {
        let mod = 1;
        let miss = this.target.misschance;
        let dmg = proc.magicdmg;
        if (proc.binaryspell) miss = this.target.binaryresist;
        else mod *= this.target.mitigation;
        if (rng10k() < miss) return 0;
        if (rng10k() < (this.stats.spellcrit * 100)) mod *= 1 + 0.5 * (1 + this.critdmgbonus * 3);
        if (proc.coeff) dmg += this.spelldamage * proc.coeff;
        return (dmg * mod * this.stats.spelldmgmod);
    }
    physproc(dmg) {
        let tmp = 0;
        let roll = rng10k();
        tmp += Math.max(this.mh.miss, 0) * 100;
        if (roll < tmp) dmg = 0;
        tmp += this.mh.dodge * 100;
        if (roll < tmp) { dmg = 0; }
        roll = rng10k();
        let crit = this.crit + this.mh.crit;
        if (roll < (crit * 100)) dmg *= 1 + 1 * (1 + this.critdmgbonus * 2);
        return dmg * this.stats.dmgmod * this.mh.modifier;
    }
    serializeStats() {
        return {
            auras: this.auras,
            spells: this.spells,
            mh: this.mh,
            oh: this.oh,
            ragenorm: this.ragenorm,
            forever: this.forever,
            proposal: this.proposal,
            uwcfg: this.uwcfg,
            dwmech: this.dwmech,
            rmauto: this.rmauto,
            rmhs: this.rmhs,
            hsmech: this.hsmech,
            whitecritmod: 1 + 1 * (1 + this.critdmgbonus * 2),
            fphit: this.fphit,
            custom: this.custom,
            variants: this.variants,
        };
    }
    log(msg) {
        let color = 'GoldenRod';
        if (msg.indexOf('attack') > 1 || msg.indexOf('Global') > -1) color = 'Gray';
        else if (msg.indexOf('tick') > 1) color = 'Tomato';
        else if (msg.indexOf(' for ') > -1) color = 'DarkOrchid';
        else if (msg.indexOf('applied') > 1 || msg.indexOf('removed') > -1) color = '#17A8B6';
        console.log(`%c ${(step / 1000).toFixed(3).padStart(6,' ')} | ${this.rage.toFixed(2).padStart(6,' ')} | ${msg}`, `color: ${color}`);
    }
    switch(stance) {
        let prev = this.stance;
        this.stance = stance;
        this.auras.battlestance.timer = 0;
        this.auras.berserkerstance.timer = 0;
        this.auras.defensivestance.timer = 0;
        this.auras.gladiatorstance.timer = 0;
        if (stance == 'battle') this.auras.battlestance.timer = 1;
        if (stance == 'zerk') this.auras.berserkerstance.timer = 1;
        if (stance == 'def') this.auras.defensivestance.timer = 1;
        if (stance == 'glad') this.auras.gladiatorstance.timer = 1;
        if (this.rage > this.talents.rageretained) this.ragestancelost += this.rage - this.talents.rageretained;
        this.rage = Math.min(this.rage, this.talents.rageretained);
        
        if (this.auras["echoes" + prev]) this.auras["echoes" + prev].use();
        if (this.auras[this.stance + "forecast"]) this.auras[this.stance + "forecast"].use();
       
        this.ragemod = (this.base.ragemod || 1) * (this.stance == 'glad' && !this.target.speed ? 1.5 : 1);
        if (this.switchrage) this.ragetimer = 10; // Rage gain is batched to prevent switching stance + casting BT on the same step
        this.stancetimer = 1000;
        this.updateAuras();
        /* start-log */ if (this.logging) this.log(`Switched to ${stance} stance`); /* end-log */
    }
    isValidStance(stance, isRend) {
        return this.stance == stance || (this.stance == 'glad' && this.shield) ||
            (stance == 'zerk' && this.auras.echoeszerk && this.auras.echoeszerk.timer) || 
            (stance == 'battle' && this.auras.echoesbattle && this.auras.echoesbattle.timer) || 
            (stance == 'def' && this.auras.echoesdef && this.auras.echoesdef.timer) || 
            (this.auras.echoesglad && this.auras.echoesglad.timer) ||
            (isRend && this.stance == 'zerk' && this.bloodfrenzy);
    }
    isEnraged() {
        return (this.auras.wreckingcrew && this.auras.wreckingcrew.timer) || 
            (this.auras.consumedrage && this.auras.consumedrage.timer) || 
            (this.auras.freshmeat && this.auras.freshmeat.timer) || 
            (this.auras.bloodrage && this.auras.bloodrage.timer) || 
            (this.auras.berserkerrage && this.auras.berserkerrage.timer);
    }
}
