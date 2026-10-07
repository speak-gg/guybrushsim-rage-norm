// "Play" mode: runs one fight in real time and lets the user press the rotation abilities.
// Combat text comes from Player.log() messages, so the /* start-log */ blocks must stay in dist builds.
// RAGE NORM build 18: ported from WarriorSim-classic. Works on the Classic and Forever tabs and uses every
// setting the batch sim uses (rage formula, ability variants, mechanics, fight settings). Adds a Keybindings menu;
// custom binds are saved in this browser (localStorage 'interactive-keybinds') and shared by both tabs.
var interactive = {

    // Fixed binds by spell classname; other abilities take the free keys from KEYS in order.
    BINDS: { Whirlwind: '2', Bloodthirst: '4', Execute: '5', Hamstring: 'r', HeroicStrike: 'wheeldown' },
    KEYS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    COOLDOWN_BINDS: { DeathWish: 'f1' },
    COOLDOWN_KEYS: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'],
    KEY_LABELS: { wheeldown: 'WD', wheelup: 'WU', mouse3: 'M3', mouse4: 'M4', mouse5: 'M5' },
    KEY_NAMES: { wheeldown: 'Mouse Wheel Down', wheelup: 'Mouse Wheel Up', mouse3: 'Middle Mouse', mouse4: 'Mouse Button 4', mouse5: 'Mouse Button 5' },
    MOD_LABELS: { ctrl: 'C', alt: 'A', shift: 'S' },
    MOD_NAMES: { ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift' },
    // Space pauses/resumes and Escape closes the window, so they can't be bound
    RESERVED_KEYS: ['space', 'escape'],
    STORAGE_BINDS: 'interactive-keybinds',
    // No global cooldown sweep on these buttons
    OFF_GCD: ['HeroicStrike', 'Cleave', 'Bloodrage', 'MightyRagePotion', 'RagePotion', 'JujuFlurry', 'Berserking'],
    // Streamed from Wowhead's CDN like the ability icons: Sword1H_ArmorFlesh(Critical), the Bloodthirst/Execute
    // impact kit (RendTarget) and "(DONOTRENAME)Combat Miss 1H"
    SOUNDS: {
        blood: [
            'https://wow.zamimg.com/sound-ids/classic/enus/195/568003/RendTarget.ogg',
        ],
        miss: [
            'https://wow.zamimg.com/sound-ids/classic/enus/27/567835/MissWhoosh1Handed.ogg',
        ],
        hit: [
            'https://wow.zamimg.com/sound-ids/classic/enus/72/567880/m1hSwordHitFlesh1a.ogg',
            'https://wow.zamimg.com/sound-ids/classic/enus/73/567881/m1hSwordHitFlesh1b.ogg',
            'https://wow.zamimg.com/sound-ids/classic/enus/75/567883/m1hSwordHitFlesh1c.ogg',
        ],
        crit: [
            'https://wow.zamimg.com/sound-ids/classic/enus/70/567878/m1hSwordHitFleshCrit.ogg',
        ],
    },
    SOUND_VOLUME: 0.6,
    HIT_SOUND_SOURCES: ['Main hand', 'Off hand', 'Heroic Strike', 'Whirlwind'],
    BLOOD_SOUND_SOURCES: ['Bloodthirst', 'Execute', 'Hamstring'],
    TARGET_AURAS: ['deepwounds', 'deepwounds2', 'deepwounds3', 'deepwounds4', 'rend', 'weaponbleedmh', 'weaponbleedoh'],
    // Icons for proc buffs that have no spell id in the data; everything else is looked up by id
    AURA_ICONS: {
        flurry: 'ability_ghoulfrenzy',
        crusader1: 'spell_holy_blessingofstrength',
        crusader2: 'spell_holy_blessingofstrength',
        bloodrage: 'ability_racial_bloodrage',
        windfury: 'spell_nature_windfury',
        berserkerrage: 'spell_nature_ancestralguardian',
    },
    STANCE_AURAS: { battlestance: 'Battle', berserkerstance: 'Berserker', defensivestance: 'Defensive', gladiatorstance: 'Gladiator' },

    init: function () {
        if (globalThis.mode !== 'classic' && globalThis.mode !== 'forever') return;
        const view = this;
        view.el = $(view.template()).appendTo('body');
        view.ui = {
            time: view.el.find('.js-ia-time'),
            dps: view.el.find('.js-ia-dps'),
            damage: view.el.find('.js-ia-damage'),
            health: view.el.find('.js-ia-health'),
            healthText: view.el.find('.js-ia-health-text'),
            executeMark: view.el.find('.js-ia-execute'),
            fct: view.el.find('.js-ia-fct'),
            rage: view.el.find('.js-ia-rage'),
            rageText: view.el.find('.js-ia-rage-text'),
            mh: view.el.find('.js-ia-mh'),
            oh: view.el.find('.js-ia-oh'),
            ohRow: view.el.find('.js-ia-oh-row'),
            cast: view.el.find('.js-ia-cast'),
            castRow: view.el.find('.js-ia-cast-row'),
            auras: view.el.find('.js-ia-auras'),
            stance: view.el.find('.js-ia-stance'),
            bar: view.el.find('.js-ia-bar'),
            cdbar: view.el.find('.js-ia-cdbar'),
            cdsection: view.el.find('.js-ia-cdsection'),
            message: view.el.find('.js-ia-message'),
            start: view.el.find('.js-ia-start'),
            overlay: view.el.find('.js-ia-overlay'),
            summary: view.el.find('.js-ia-summary'),
            ruleset: view.el.find('.js-ia-ruleset'),
            kb: view.el.find('.js-ia-kb'),
            kbList: view.el.find('.js-ia-kb-list'),
            kbStatus: view.el.find('.js-ia-kb-status'),
        };

        $('body').on('click', '.js-play', function (e) {
            e.preventDefault();
            view.open();
        });
        view.el.on('click', '.js-ia-close', function (e) { e.preventDefault(); view.close(); });
        view.el.on('click', '.js-ia-start', function (e) { e.preventDefault(); view.togglePause(); });
        view.el.on('click', '.js-ia-restart', function (e) { e.preventDefault(); view.newFight(); });
        view.el.on('click', '.js-ia-sound', function (e) {
            e.preventDefault();
            view.muted = !view.muted;
            try { localStorage.setItem('interactive-muted', view.muted ? '1' : '0'); } catch (err) { }
            view.updateSoundButton();
        });
        view.el.on('click', '.js-ia-cooldowns', function (e) {
            e.preventDefault();
            view.manualCooldowns = !view.manualCooldowns;
            try { localStorage.setItem('interactive-manual-cooldowns', view.manualCooldowns ? '1' : '0'); } catch (err) { }
            view.updateCooldownButton();
            view.newFight();
        });
        view.el.on('click', '.js-ia-speed', function (e) {
            e.preventDefault();
            view.speed = parseFloat($(this).data('speed'));
            view.el.find('.js-ia-speed').removeClass('active');
            $(this).addClass('active');
        });
        view.el.on('mousedown', '.ia-action', function (e) {
            if (e.button !== 0) return;
            e.preventDefault();
            view.press(parseInt($(this).data('index')));
        });

        // Keybindings menu
        view.el.on('click', '.js-ia-keybinds', function (e) { e.preventDefault(); view.openKeybinds(); });
        view.el.on('click', '.js-ia-kb-cancel', function (e) { e.preventDefault(); view.closeKeybinds(false); });
        view.el.on('click', '.js-ia-kb-save', function (e) { e.preventDefault(); view.closeKeybinds(true); });
        view.el.on('click', '.js-ia-kb-reset', function (e) { e.preventDefault(); view.resetKeybinds(); });
        view.el.on('click', '.js-ia-kb-bind', function (e) {
            e.preventDefault();
            e.stopPropagation();
            view.startCapture($(this).closest('.ia-kb-row').data('classname'));
        });
        view.el.on('click', '.js-ia-kb-clear', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const classname = $(this).closest('.ia-kb-row').data('classname');
            view.kbDraft[classname] = '';
            view.capturing = null;
            view.kbStatus('');
            view.renderKeybinds();
        });
        view.el.on('click', '.js-ia-kb', function (e) {
            // Clicking anywhere else in the menu stops waiting for a key
            if (view.capturing && !$(e.target).closest('.js-ia-kb-bind').length) {
                view.capturing = null;
                view.renderKeybinds();
            }
        });

        $(document).on('keydown', function (e) {
            if (!view.isOpen) return;
            if (view.kbOpen) {
                view.onKeybindKey(e);
                return;
            }
            if (e.key === 'Escape') { e.preventDefault(); view.close(); return; }
            if (e.key === ' ') { e.preventDefault(); view.togglePause(); return; }
            if (e.metaKey) return;
            const key = view.keyFromEvent(e);
            if (!key) return;
            const index = view.actions ? view.actions.findIndex(a => a.key === key) : -1;
            if (index > -1) {
                e.preventDefault();
                if (!e.repeat) view.press(index);
            }
        });
        view.el[0].addEventListener('wheel', function (e) {
            e.preventDefault();
            if (!e.deltaY) return;
            const key = view.modifierPrefix(e) + (e.deltaY > 0 ? 'wheeldown' : 'wheelup');
            if (view.kbOpen) {
                if (view.capturing) view.assignCaptured(key);
                return;
            }
            if (!view.running || !view.actions) return;
            const index = view.actions.findIndex(a => a.key === key);
            if (index > -1) view.press(index);
        }, { passive: false });
        // Middle mouse and mouse buttons 4/5 can be bound too (the browser's back/forward is blocked while the window is open)
        view.el[0].addEventListener('mousedown', function (e) {
            const button = { 1: 'mouse3', 3: 'mouse4', 4: 'mouse5' }[e.button];
            if (!button) return;
            e.preventDefault();
            const key = view.modifierPrefix(e) + button;
            if (view.kbOpen) {
                if (view.capturing) view.assignCaptured(key);
                return;
            }
            if (!view.actions) return;
            const index = view.actions.findIndex(a => a.key === key);
            if (index > -1) view.press(index);
        });
        for (let type of ['mouseup', 'auxclick']) {
            view.el[0].addEventListener(type, function (e) {
                if (e.button === 1 || e.button === 3 || e.button === 4) e.preventDefault();
            });
        }
        document.addEventListener('visibilitychange', function () {
            if (document.hidden && view.running) view.togglePause();
        });

        view.speed = 1;
        try { view.muted = localStorage.getItem('interactive-muted') === '1'; } catch (err) { view.muted = false; }
        try { view.manualCooldowns = localStorage.getItem('interactive-manual-cooldowns') === '1'; } catch (err) { view.manualCooldowns = false; }
        view.loadBinds();
        view.updateSoundButton();
        view.updateCooldownButton();
    },

    // ---------- Keybindings ----------

    // Stored custom binds: { classname: key } ('' = deliberately unbound). null = never customised, use the defaults.
    loadBinds: function () {
        let binds = null;
        try { binds = JSON.parse(localStorage.getItem(this.STORAGE_BINDS) || 'null'); } catch (err) { binds = null; }
        if (binds && typeof binds === 'object') {
            for (let name in binds) if (binds[name] === 'wheel') binds[name] = 'wheeldown';
        }
        else binds = null;
        this.customBinds = binds;
    },

    saveBinds: function (binds) {
        this.customBinds = binds;
        try { localStorage.setItem(this.STORAGE_BINDS, JSON.stringify(binds)); } catch (err) { }
    },

    // Default binds as in WarriorSim-classic: fixed binds first, then the free keys in order.
    defaultBinds: function (abilities, cooldowns) {
        const view = this, out = {};
        const free = view.KEYS.filter(k => !Object.values(view.BINDS).includes(k));
        for (let name of abilities) if (view.BINDS[name]) out[name] = view.BINDS[name];
        for (let name of abilities) if (!(name in out)) out[name] = free.shift() || '';
        const freeF = view.COOLDOWN_KEYS.filter(k => !Object.values(view.COOLDOWN_BINDS).includes(k));
        for (let name of cooldowns) if (view.COOLDOWN_BINDS[name]) out[name] = view.COOLDOWN_BINDS[name];
        for (let name of cooldowns) if (!(name in out)) out[name] = freeF.shift() || '';
        return out;
    },

    // Custom binds win; anything never customised gets its default key, unless a custom bind already took it.
    resolveBinds: function (abilities, cooldowns) {
        const view = this;
        const defaults = view.defaultBinds(abilities, cooldowns);
        const custom = view.customBinds;
        if (!custom) return defaults;
        const out = {};
        const used = new Set();
        for (let name of abilities.concat(cooldowns)) {
            if (name in custom) {
                out[name] = custom[name] || '';
                if (out[name]) used.add(out[name]);
            }
        }
        for (let name of abilities.concat(cooldowns)) {
            if (name in out) continue;
            let key = defaults[name];
            if (!key || used.has(key)) {
                const pool = cooldowns.includes(name) ? view.COOLDOWN_KEYS : view.KEYS;
                key = pool.find(k => !used.has(k)) || '';
            }
            out[name] = key;
            if (key) used.add(key);
        }
        return out;
    },

    modifierPrefix: function (e) {
        return (e.ctrlKey ? 'ctrl+' : '') + (e.altKey ? 'alt+' : '') + (e.shiftKey ? 'shift+' : '');
    },

    // Normalised key name from a keydown event, e.g. '4', 'q', 'f1', 'num5', 'shift+2'. Uses the physical key
    // (event.code) so Shift+1 is stored as 'shift+1' rather than '!'. Returns '' for a bare modifier key.
    keyFromEvent: function (e) {
        const code = e.code || '';
        let key;
        let m;
        if ((m = code.match(/^Digit(\d)$/))) key = m[1];
        else if ((m = code.match(/^Key([A-Z])$/))) key = m[1].toLowerCase();
        else if ((m = code.match(/^F(\d{1,2})$/))) key = 'f' + m[1];
        else if ((m = code.match(/^Numpad(\d)$/))) key = 'num' + m[1];
        else {
            const named = {
                Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Semicolon: ';', Quote: "'", Comma: ',',
                Period: '.', Slash: '/', Backslash: '\\', Backquote: '`', Tab: 'tab', Space: 'space', Escape: 'escape',
                NumpadAdd: 'num+', NumpadSubtract: 'num-', NumpadMultiply: 'num*', NumpadDivide: 'num/', NumpadDecimal: 'num.',
                NumpadEnter: 'numenter', Enter: 'enter', Backspace: 'backspace', Delete: 'delete', Insert: 'insert',
                Home: 'home', End: 'end', PageUp: 'pageup', PageDown: 'pagedown', CapsLock: 'capslock',
                ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
            };
            if (named[code]) key = named[code];
            else if (['Shift', 'Control', 'Alt', 'Meta', 'OS', 'AltGraph'].includes(e.key) || /^(Shift|Control|Alt|Meta|OS)/.test(code)) return '';
            else key = (e.key || '').toLowerCase();
        }
        if (!key || key === 'capslock') return '';
        return this.modifierPrefix(e) + key;
    },

    // Short label for an action button, e.g. 'S2', 'F1', 'WD'
    keyLabel: function (key) {
        if (!key) return '';
        const parts = key.split('+');
        let base = parts.pop();
        if (base === '' && parts.length) base = parts.pop() + '+'; // 'num+'
        const mods = parts.map(p => this.MOD_LABELS[p] || '').join('');
        const label = this.KEY_LABELS[base] || base.replace(/^num/, 'N').toUpperCase();
        return mods + label;
    },

    // Full name for the Keybindings menu, e.g. 'Shift + 2', 'Mouse Wheel Down'
    keyName: function (key) {
        if (!key) return '';
        const parts = key.split('+');
        let base = parts.pop();
        if (base === '' && parts.length) base = parts.pop() + '+';
        const mods = parts.map(p => this.MOD_NAMES[p] || p);
        let name = this.KEY_NAMES[base];
        if (!name) {
            if (/^num./.test(base)) name = 'Numpad ' + base.slice(3).toUpperCase();
            else if (base.length === 1) name = base.toUpperCase();
            else name = base.charAt(0).toUpperCase() + base.slice(1);
        }
        return mods.concat([name]).join(' + ');
    },

    // Every ability the current character can use in Play Fight, plus every cooldown (even while cooldowns are automatic).
    bindableSpells: function () {
        const view = this;
        const describe = (spell) => {
            const data = spells.find(s => s.id == spell.id) || {};
            return { classname: data.classname || spell.constructor.name, name: data.name || spell.name, icon: (data.iconname || 'inv_misc_questionmark').toLowerCase() };
        };
        const unique = (list) => list.filter((x, i) => list.findIndex(y => y.classname === x.classname) === i);
        const abilities = view.player ? unique(view.player.manualspells.map(describe)) : [];
        let cooldownSpells = view.player ? view.player.cooldownspells : [];
        if (!view.manualCooldowns) {
            try { cooldownSpells = InteractiveSimulation.createPlayer({ manualCooldowns: true }).cooldownspells || []; }
            catch (err) { cooldownSpells = []; }
        }
        const cooldowns = unique(cooldownSpells.map(describe));
        return { abilities, cooldowns };
    },

    openKeybinds: function () {
        const view = this;
        if (!view.player) return;
        if (view.running) view.togglePause();
        const list = view.bindableSpells();
        view.kbSpells = list;
        view.kbDraft = view.resolveBinds(list.abilities.map(a => a.classname), list.cooldowns.map(c => c.classname));
        view.capturing = null;
        view.kbOpen = true;
        view.kbStatus('');
        view.renderKeybinds();
        view.ui.kb.addClass('open');
    },

    closeKeybinds: function (save) {
        const view = this;
        if (save) {
            // Keep binds for abilities not shown right now (e.g. Mortal Strike while specced Fury)
            const merged = Object.assign({}, view.customBinds || {}, view.kbDraft);
            const used = new Set(Object.values(view.kbDraft).filter(Boolean));
            for (let name in merged) if (!(name in view.kbDraft) && used.has(merged[name])) merged[name] = '';
            view.saveBinds(merged);
            if (view.player) {
                view.buildActionBar();
                view.render();
            }
            view.showMessage('Keybindings saved');
        }
        view.kbOpen = false;
        view.capturing = null;
        view.ui.kb.removeClass('open');
    },

    resetKeybinds: function () {
        const view = this;
        view.kbDraft = view.defaultBinds(view.kbSpells.abilities.map(a => a.classname), view.kbSpells.cooldowns.map(c => c.classname));
        view.capturing = null;
        view.kbStatus('Defaults restored. Save to keep them.');
        view.renderKeybinds();
    },

    kbStatus: function (text) {
        if (this.ui && this.ui.kbStatus) this.ui.kbStatus.text(text || '');
    },

    startCapture: function (classname) {
        const view = this;
        view.capturing = view.capturing === classname ? null : classname;
        view.kbStatus(view.capturing ? 'Press a key, mouse wheel or mouse button 3/4/5 (with Shift, Ctrl or Alt if you like). Escape cancels.' : '');
        view.renderKeybinds();
    },

    onKeybindKey: function (e) {
        const view = this;
        if (!view.capturing) {
            if (e.key === 'Escape') { e.preventDefault(); view.closeKeybinds(false); }
            else if (e.key === 'Enter') { e.preventDefault(); view.closeKeybinds(true); }
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'Escape' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            view.capturing = null;
            view.kbStatus('');
            view.renderKeybinds();
            return;
        }
        if (e.metaKey) return;
        const key = view.keyFromEvent(e);
        if (!key) return; // modifier on its own: wait for the real key
        view.assignCaptured(key);
    },

    assignCaptured: function (key) {
        const view = this;
        const target = view.capturing;
        if (!target) return;
        if (view.RESERVED_KEYS.includes(key)) {
            view.kbStatus(`${view.keyName(key)} is reserved (Space pauses, Escape closes). Pick another key.`);
            return;
        }
        let moved = '';
        for (let name in view.kbDraft) {
            if (name !== target && view.kbDraft[name] === key) {
                view.kbDraft[name] = '';
                const entry = view.kbSpells.abilities.concat(view.kbSpells.cooldowns).find(x => x.classname === name);
                moved = entry ? entry.name : name;
            }
        }
        view.kbDraft[target] = key;
        view.capturing = null;
        view.kbStatus(moved ? `${view.keyName(key)} was taken from ${moved}, which is now unbound.` : '');
        view.renderKeybinds();
    },

    renderKeybinds: function () {
        const view = this;
        const row = (entry) => {
            const key = view.kbDraft[entry.classname] || '';
            const waiting = view.capturing === entry.classname;
            return `<div class="ia-kb-row${waiting ? ' capturing' : ''}" data-classname="${entry.classname}">
                <img src="https://wow.zamimg.com/images/wow/icons/medium/${entry.icon}.jpg" alt="">
                <span class="ia-kb-name">${entry.name}</span>
                <a href="#" class="ia-btn ia-kb-key js-ia-kb-bind">${waiting ? 'Press a key...' : (key ? view.keyName(key) : '<em>Unbound</em>')}</a>
                <a href="#" class="ia-btn ia-kb-clear js-ia-kb-clear" title="Unbind">&times;</a>
            </div>`;
        };
        const { abilities, cooldowns } = view.kbSpells;
        let html = `<h4>Abilities</h4>${abilities.length ? abilities.map(row).join('') : '<p class="ia-kb-note">No abilities available with the current settings.</p>'}`;
        if (cooldowns.length) {
            html += `<h4>Cooldowns</h4>`;
            if (!view.manualCooldowns) html += `<p class="ia-kb-note">Cooldowns are used automatically right now. These binds apply when you switch to <b>Cooldowns: Manual</b>.</p>`;
            html += cooldowns.map(row).join('');
        }
        view.ui.kbList.html(html);
    },

    updateCooldownButton: function () {
        this.el.find('.js-ia-cooldowns').text(this.manualCooldowns ? 'Cooldowns: Manual' : 'Cooldowns: Auto').toggleClass('active', this.manualCooldowns);
    },

    loadSounds: function () {
        const view = this;
        if (view.sounds) return;
        view.sounds = {};
        for (let type in view.SOUNDS) {
            view.sounds[type] = view.SOUNDS[type].map(url => {
                const audio = new Audio(url);
                audio.preload = 'auto';
                return audio;
            });
        }
    },

    playSound: function (type) {
        const view = this;
        if (view.muted || !view.running || !view.sounds) return;
        const list = view.sounds[type];
        const audio = list[Math.floor(Math.random() * list.length)].cloneNode();
        audio.volume = view.SOUND_VOLUME;
        audio.play().catch(() => { });
    },

    updateSoundButton: function () {
        this.el.find('.js-ia-sound').text(this.muted ? 'Sound: Off' : 'Sound: On').toggleClass('active', !this.muted);
    },

    template: function () {
        return `
        <section class="interactive">
          <div class="ia-window">
            <header>
              <div class="ia-stat"><label>Time</label><span class="js-ia-time">0.0</span></div>
              <div class="ia-stat ia-dps"><label>Fight DPS</label><span class="js-ia-dps">0.0</span></div>
              <div class="ia-stat"><label>Damage</label><span class="js-ia-damage">0</span></div>
              <div class="ia-controls">
                <a href="#" class="ia-btn js-ia-speed" data-speed="0.5">0.5x</a>
                <a href="#" class="ia-btn js-ia-speed active" data-speed="1">1x</a>
                <a href="#" class="ia-btn js-ia-speed" data-speed="2">2x</a>
                <a href="#" class="ia-btn js-ia-cooldowns">Cooldowns: Auto</a>
                <a href="#" class="ia-btn js-ia-keybinds">Keybindings</a>
                <a href="#" class="ia-btn js-ia-sound">Sound: On</a>
                <a href="#" class="ia-btn js-ia-restart">Restart</a>
                <a href="#" class="ia-btn js-ia-close">Close</a>
              </div>
            </header>
            <div class="ia-ruleset js-ia-ruleset"></div>
            <div class="ia-arena">
              <div class="ia-target">
                <div class="ia-target-name">Target (Level <span class="js-ia-target-level"></span>)</div>
                <div class="ia-healthbar"><div class="ia-health js-ia-health"></div><div class="ia-execute js-ia-execute"></div><span class="js-ia-health-text">100%</span></div>
                <div class="ia-fct js-ia-fct"></div>
              </div>
              <div class="ia-auras js-ia-auras"></div>
              <div class="ia-overlay js-ia-overlay">
                <div class="ia-summary js-ia-summary"></div>
                <a href="#" class="ia-btn ia-start js-ia-start">Start (Space)</a>
              </div>
            </div>
            <div class="ia-player">
              <div class="ia-buffs"><span class="ia-stance js-ia-stance"></span></div>
              <div class="ia-bars">
                <div class="ia-row"><label>Rage</label><div class="ia-bar ia-rage"><div class="js-ia-rage"></div><span class="js-ia-rage-text">0</span></div></div>
                <div class="ia-row"><label>Main hand</label><div class="ia-bar ia-swing"><div class="js-ia-mh"></div></div></div>
                <div class="ia-row js-ia-oh-row"><label>Off hand</label><div class="ia-bar ia-swing"><div class="js-ia-oh"></div></div></div>
                <div class="ia-row js-ia-cast-row"><label>Slam</label><div class="ia-bar ia-cast"><div class="js-ia-cast"></div></div></div>
              </div>
              <div class="ia-message js-ia-message"></div>
              <div class="ia-actionbar js-ia-bar"></div>
              <div class="ia-cdsection js-ia-cdsection">
                <label>Cooldowns</label>
                <div class="ia-actionbar js-ia-cdbar"></div>
              </div>
            </div>
          </div>
          <div class="ia-kb js-ia-kb">
            <div class="ia-kb-window">
              <h3>Keybindings</h3>
              <p class="ia-kb-note">Click a binding, then press the key (Shift, Ctrl and Alt combinations, the mouse wheel and mouse buttons 3-5 work too). Saved in this browser for both the Classic and Forever tabs.</p>
              <div class="ia-kb-list js-ia-kb-list"></div>
              <div class="ia-kb-status js-ia-kb-status"></div>
              <div class="ia-kb-buttons">
                <a href="#" class="ia-btn js-ia-kb-reset">Reset to defaults</a>
                <span class="ia-kb-spacer"></span>
                <a href="#" class="ia-btn js-ia-kb-cancel">Cancel</a>
                <a href="#" class="ia-btn ia-kb-save js-ia-kb-save">Save</a>
              </div>
            </div>
          </div>
        </section>`;
    },

    open: function () {
        const view = this;
        view.isOpen = true;
        view.el.addClass('open');
        view.loadSounds();
        view.newFight();
    },

    close: function () {
        const view = this;
        if (view.kbOpen) view.closeKeybinds(false);
        view.stop();
        view.isOpen = false;
        view.el.removeClass('open');
        view.player = null;
        view.sim = null;
    },

    newFight: function () {
        const view = this;
        view.stop();
        let player;
        try {
            player = InteractiveSimulation.createPlayer({ manualCooldowns: view.manualCooldowns });
        }
        catch (err) {
            console.error(err);
            view.showMessage('Could not build the character from the current settings', true);
            return;
        }
        if (!player.mh) {
            view.close();
            SIM.UI.addAlert('No weapon selected');
            return;
        }
        player.log = (msg) => view.onLog(msg);

        const sim = new InteractiveSimulation(player);
        sim.onreject = (spell, reason) => view.onReject(spell, reason);
        sim.start();

        view.player = player;
        view.sim = sim;
        view.clock = 0;
        view.breakdown = {};
        view.running = false;

        view.el.find('.js-ia-target-level').text(player.target.level);
        const tab = globalThis.mode === 'forever' ? 'Forever' : 'Classic';
        const formula = player.proposal ? 'PROPOSAL (locked settings)' : player.forever ? 'Forever v2' : player.ragenorm ? (player.ragenorm.modc ? 'Curved + Modified Classic coefficient' : 'Curved') : 'Classic';
        view.ui.ruleset.text(`${tab} tab settings` + (formula ? ` \u00b7 Rage formula: ${formula}` : '') + ` \u00b7 Fight ${sim.duration.toFixed(0)}s, execute at ${sim.executeperc}%`);
        view.ui.executeMark.css('left', (sim.executeperc) + '%');
        view.ui.ohRow.toggle(!!player.oh);
        view.ui.fct.empty();
        view.ui.auras.empty();
        view.auraEls = {};
        view.ui.summary.empty();
        view.ui.start.text('Start (Space)');
        view.ui.overlay.addClass('visible');
        view.buildActionBar();
        view.showMessage('');
        view.render();
    },

    buildActionBar: function () {
        const view = this;
        view.ui.bar.empty();
        view.ui.cdbar.empty();
        const describe = (spell) => ({ spell, data: spells.find(s => s.id == spell.id) || {} });

        const entries = view.player.manualspells.map(describe);
        const cooldowns = view.player.cooldownspells.map(describe);
        // Bindable cooldowns are resolved too (even while automatic) so a cooldown's default key never doubles up.
        let allCooldowns = cooldowns.map(e => e.data.classname);
        if (!view.manualCooldowns) {
            try { allCooldowns = (InteractiveSimulation.createPlayer({ manualCooldowns: true }).cooldownspells || []).map(s => (spells.find(x => x.id == s.id) || {}).classname); }
            catch (err) { allCooldowns = []; }
        }
        const binds = view.resolveBinds(entries.map(e => e.data.classname), allCooldowns.filter(Boolean));
        for (let entry of entries) {
            entry.key = binds[entry.data.classname] || '';
            entry.container = view.ui.bar;
        }
        for (let entry of cooldowns) {
            entry.key = binds[entry.data.classname] || '';
            entry.container = view.ui.cdbar;
        }
        const order = (key) => { const i = view.COOLDOWN_KEYS.indexOf(key); return i < 0 ? 99 : i; };
        cooldowns.sort((a, b) => order(a.key) - order(b.key));
        view.ui.cdsection.toggle(cooldowns.length > 0);

        view.actions = entries.concat(cooldowns).map(({ spell, data, key, container }, i) => {
            const icon = (data.iconname || 'inv_misc_questionmark').toLowerCase();
            const name = data.name || spell.name;
            const label = view.keyLabel(key);
            const el = $(`<div class="ia-action" data-index="${i}" title="${name}${key ? ' (' + view.keyName(key) + ')' : ''}">
                <img src="https://wow.zamimg.com/images/wow/icons/medium/${icon}.jpg" alt="${name}">
                <div class="ia-cd"></div><span class="ia-cd-text"></span>
                <span class="ia-key">${label}</span>
                <span class="ia-name">${name}</span>
            </div>`).appendTo(container);
            return { spell, key, el, offGcd: view.OFF_GCD.includes(data.classname), cd: el.find('.ia-cd'), cdText: el.find('.ia-cd-text') };
        });
    },

    auraIcon: function (key, aura) {
        const data = aura.id && (spells.find(s => s.id == aura.id) || buffs.find(b => b.id == aura.id));
        const icon = this.AURA_ICONS[key] || (data && data.iconname);
        const picture = icon
            ? `<img src="https://wow.zamimg.com/images/wow/icons/medium/${icon.toLowerCase()}.jpg" alt="">`
            : `<span class="ia-aura-letters">${aura.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2)}</span>`;
        return $(`<div class="ia-aura" title="${aura.name}">${picture}<span class="ia-aura-stacks"></span><span class="ia-aura-time"></span></div>`);
    },

    // Remaining/total ms to show on a button; "active" means a buff or DoT from it is currently up.
    cooldownOf: function (spell, now) {
        if (spell instanceof Aura) {
            if (spell.timer > now) return { remaining: spell.timer - now, total: (spell.duration || 0) * 1000, active: true };
            if (spell.usestep > now && spell.cooldown) return { remaining: spell.usestep - now, total: spell.cooldown * 1000 };
            return { remaining: 0, total: 0 };
        }
        // Execute only has a real cooldown when the "Execute cooldown" setting is above 0
        if (spell instanceof Execute) {
            if (!InteractiveSimulation.executeOnCooldown(spell)) return { remaining: 0, total: 0 };
            return { remaining: spell.timer, total: spell.player.variants.execd * 1000 };
        }
        if (!spell.timer) return { remaining: 0, total: 0 };
        return { remaining: spell.timer, total: (spell.cooldown || 0) * 1000 || spell.timer };
    },

    togglePause: function () {
        const view = this;
        if (!view.sim) return;
        if (view.sim.done) {
            view.newFight();
            return;
        }
        if (view.running) {
            view.stop();
            view.ui.start.text('Resume (Space)');
            view.ui.overlay.addClass('visible');
        }
        else {
            view.running = true;
            view.ui.overlay.removeClass('visible');
            view.last = performance.now();
            view.frameId = requestAnimationFrame((t) => view.frame(t));
        }
    },

    stop: function () {
        this.running = false;
        if (this.frameId) cancelAnimationFrame(this.frameId);
        this.frameId = null;
    },

    frame: function (now) {
        const view = this;
        if (!view.running) return;
        const elapsed = Math.min(now - view.last, 100);
        view.last = now;
        view.clock += elapsed * view.speed;
        view.sim.advance(Math.floor(view.clock));
        view.render();
        if (view.sim.done) {
            view.stop();
            view.showSummary();
            return;
        }
        view.frameId = requestAnimationFrame((t) => view.frame(t));
    },

    press: function (index) {
        const view = this;
        const action = view.actions && view.actions[index];
        if (!action || !view.sim) return;
        if (!view.running) {
            if (view.sim.done) return;
            view.togglePause();
        }
        const result = view.sim.press(action.spell);
        if (!result.ok) view.onReject(action.spell, result.reason);
        else {
            action.el.addClass('pressed');
            setTimeout(() => action.el.removeClass('pressed'), 120);
        }
    },

    onReject: function (spell, reason) {
        const action = this.actions.find(a => a.spell === spell);
        if (action) {
            action.el.removeClass('rejected');
            void action.el[0].offsetWidth;
            action.el.addClass('rejected');
        }
        this.showMessage(reason, true);
    },

    showMessage: function (text, error) {
        const view = this;
        clearTimeout(view.messageTimer);
        view.ui.message.text(text).toggleClass('error', !!error);
        if (text) view.messageTimer = setTimeout(() => view.ui.message.text(''), 1500);
    },

    // Turns Player.log() lines into combat text, e.g. "Bloodthirst for 512 (CRIT)." or "Deep Wounds tick for 23.50".
    onLog: function (msg) {
        const view = this;
        if (msg.startsWith('Target attack')) return;
        const match = msg.match(/^(.+?) (tick )?(?:hit )?for (\d+(?:\.\d+)?)(?: \((HIT|MISS|DODGE|CRIT|GLANCE)\))?/);
        if (!match) return;
        let source = match[1];
        const tick = !!match[2];
        const amount = parseFloat(match[3]);
        const result = match[4] || 'HIT';

        let kind = 'ability';
        if (source === 'Main hand attack') { source = 'Main hand'; kind = 'white'; }
        else if (source === 'Off hand attack') { source = 'Off hand'; kind = 'offhand'; }
        else if (tick) kind = 'tick';
        else if (!match[4]) kind = 'proc';
        if (source.endsWith(' (OH)')) { source = source.slice(0, -5); kind = 'offhand'; }

        const entry = view.breakdown[source] || (view.breakdown[source] = { damage: 0, count: 0, crits: 0 });
        entry.damage += amount;
        entry.count++;
        if (result === 'CRIT') entry.crits++;

        if (result === 'MISS' || result === 'DODGE') view.playSound('miss');
        else if (view.BLOOD_SOUND_SOURCES.includes(source)) view.playSound('blood');
        else if (result === 'CRIT') {
            view.playSound('crit');
            view.playSound('blood');
        }
        else if (view.HIT_SOUND_SOURCES.includes(source)) view.playSound('hit');

        view.floatText(result, amount, kind);
    },

    floatText: function (result, amount, kind) {
        const view = this;
        let text;
        if (result === 'MISS') text = 'Miss';
        else if (result === 'DODGE') text = 'Dodge';
        else text = Math.round(amount) + (result === 'CRIT' ? '!' : '');
        if (!text || text === '0') return;
        if (view.ui.fct.children().length > 40) view.ui.fct.children().first().remove();
        const x = 20 + Math.random() * 60;
        $(`<span class="ia-float ${kind} ${result.toLowerCase()}" style="left:${x}%">${text}</span>`)
            .appendTo(view.ui.fct)
            .on('animationend', function () { $(this).remove(); });
    },

    render: function () {
        const view = this;
        const sim = view.sim, player = view.player;
        if (!sim) return;
        const now = Math.min(step, sim.maxsteps);
        const damage = sim.done ? sim.result.damage : sim.currentDamage();
        const seconds = now / 1000;

        view.ui.time.text(`${seconds.toFixed(1)} / ${sim.duration.toFixed(1)}s`);
        view.ui.dps.text(seconds > 0 ? (damage / seconds).toFixed(1) : '0.0');
        view.ui.damage.text(Math.round(damage).toLocaleString());

        const health = Math.max(0, 100 * (1 - now / sim.maxsteps));
        view.ui.health.css('width', health + '%').toggleClass('execute', now >= sim.executestep);
        view.ui.healthText.text(health.toFixed(0) + '%');

        view.ui.rage.css('width', player.rage + '%');
        view.ui.rageText.text(Math.floor(player.rage));

        const swing = (weapon) => {
            const full = weapon.speed * 1000 / player.stats.haste;
            return Math.max(0, Math.min(100, 100 * (1 - weapon.timer / full)));
        };
        view.ui.mh.css('width', swing(player.mh) + '%');
        if (player.oh) view.ui.oh.css('width', swing(player.oh) + '%');

        if (sim.slamstep && sim.slamspell && sim.slamspell.casttime) {
            const left = sim.slamstep - now;
            view.ui.castRow.addClass('visible');
            view.ui.cast.css('width', Math.max(0, 100 * (1 - left / sim.slamspell.casttime)) + '%');
        }
        else view.ui.castRow.removeClass('visible');

        let stance = '';
        const shown = new Set();
        for (let key in player.auras) {
            const aura = player.auras[key];
            if (!aura.timer) continue;
            if (view.STANCE_AURAS[key]) { stance = view.STANCE_AURAS[key] + ' Stance'; continue; }
            if (view.TARGET_AURAS.includes(key)) continue;
            shown.add(key);
            const el = view.auraEls[key] || (view.auraEls[key] = view.auraIcon(key, aura).appendTo(view.ui.auras));
            // Most auras store their end time in timer; charge-based ones like Flurry use stacks instead.
            // Battle Shout is held up for the whole fight, so it has no countdown.
            const timed = aura.timer > now + 1 && key !== 'battleshout';
            el.find('.ia-aura-time').text(timed ? Math.ceil((aura.timer - now) / 1000) + 's' : '');
            el.find('.ia-aura-stacks').text(aura.stacks > 1 ? aura.stacks : '');
        }
        for (let key in view.auraEls) {
            if (shown.has(key)) continue;
            view.auraEls[key].remove();
            delete view.auraEls[key];
        }
        view.ui.stance.text(stance);

        for (let action of view.actions) {
            const spell = action.spell;
            const isSwing = spell instanceof HeroicStrike || spell instanceof Cleave;
            let { remaining, total, active } = view.cooldownOf(spell, now);
            if (!active && !action.offGcd && player.timer > remaining) {
                remaining = player.timer;
                total = 1500;
            }
            const fraction = !active && total ? Math.max(0, Math.min(1, remaining / total)) : 0;
            action.cd.css('--p', (fraction * 100) + '%').toggleClass('active', fraction > 0);
            action.cdText.text(remaining > 1500 || (active && remaining > 0) ? Math.ceil(remaining / 1000) : '');
            action.el.toggleClass('buffing', !!active);

            // Dim only when it can't be used for reasons other than the GCD or its own cooldown timer
            let usable;
            if (isSwing) usable = player.nextswinghs || spell.canUse();
            else {
                const gcd = player.timer, cd = spell.timer;
                player.timer = 0;
                if (!(spell instanceof Aura)) spell.timer = 0;
                usable = !!spell.canUse();
                player.timer = gcd;
                spell.timer = cd;
            }
            action.el.toggleClass('unusable', !usable && !active && !sim.done);
            action.el.toggleClass('queued', isSwing ? !!player.nextswinghs : sim.pending === spell);
            action.el.toggleClass('highlight', !!(spell instanceof Execute && usable && !sim.done));
        }
    },

    showSummary: function () {
        const view = this;
        const result = view.sim.result;
        const simDps = parseFloat($('.sidebar .bottom .dps').first().text());
        let compare = '';
        if (simDps > 0) {
            compare = `<p class="ia-compare">${(100 * result.dps / simDps).toFixed(1)}% of the simulated rotation (${simDps.toFixed(1)} DPS)</p>`;
        }
        const entries = Object.entries(view.breakdown);
        // Some procs are logged without an amount; show whatever the log missed as one line
        const logged = entries.reduce((sum, [, e]) => sum + e.damage, 0);
        if (result.damage - logged > result.damage * 0.005) entries.push(['Other', { damage: result.damage - logged, count: 0, crits: 0 }]);
        const rows = entries
            .sort((a, b) => b[1].damage - a[1].damage)
            .map(([name, e]) => `<tr><td>${name}</td><td>${Math.round(e.damage).toLocaleString()}</td><td>${(100 * e.damage / result.damage).toFixed(1)}%</td><td>${e.count || ''}</td><td>${e.count ? (100 * e.crits / e.count).toFixed(0) + '%' : ''}</td></tr>`)
            .join('');
        view.ui.summary.html(`
            <h3>Fight over</h3>
            <p class="ia-final">${result.dps.toFixed(1)} DPS</p>
            <p>${Math.round(result.damage).toLocaleString()} damage in ${result.duration.toFixed(1)}s</p>
            ${compare}
            <table><thead><tr><th>Source</th><th>Damage</th><th>Share</th><th>Count</th><th>Crit</th></tr></thead><tbody>${rows}</tbody></table>`);
        view.ui.start.text('Play again (Space)');
        view.ui.overlay.addClass('visible');
    },
};

$(function () {
    interactive.init();
});
