# WarriorSim: Rage Norm

A fork of [WarriorSim](https://github.com/GuybrushGit/WarriorSim), the WoW Classic and Season of Discovery warrior DPS simulator by Guybrush-Golemagg. This fork is maintained by Speak-Grobbulus, and adds tools for studying how rage generation shapes warrior damage. It's extended for the design proposal [A Better Trade for Normalized Rage](https://github.com/speak-gg/warrior-rage-proposal).

**Live sim:** [Classic](https://speak-gg.github.io/guybrushsim-rage-norm/classic.html) · [Forever](https://speak-gg.github.io/guybrushsim-rage-norm/forever.html)

## What this fork adds

### Three tabs

- **Classic:** Guybrush's Classic sim, plus every option below. With everything at its default, it behaves exactly like the original.
- **Forever:** set up for WoW: Forever's beta rules (1 Oct 2026), ready to use:
  - Forever v2 rage;
  - Bloodthirst 45% AP;
  - Flurry 25% for 3 swings;
  - Whirlwind hits with both hands;
  - Unbridled Wrath 60%, white swings only;
  - Dual Wield Specialization +50% off-hand rage;
  - Death Wish 20% for 30 s;
  - no Execute cooldown;
  - Deep Wounds stacks (each crit adds main-hand weapon damage, no attack power, over the next 4 ticks).

  The only settings exposed are Whirlwind rage cost (22 with Raging Blows), Furious Precision off-hand hit and the test stats.
- **Season of Discovery:** unchanged from the original and not tested in this fork. A notice says so on load.

### Rage tracking

- A **Rage Generated** table that breaks rage down by source: auto attacks by hand and outcome, Windfury swings, Unbridled Wrath, Bloodrage, Anger Management and refunds.
- A **rage budget** that accounts for every point of rage: what was generated, what was spent, what overflowed the 100 cap, and what was left over.
- **True RPM**, which counts the rage from white swings that Heroic Strike replaced, plus Heroic Strike's real rage cost.

### Rage Formula (Classic tab)

| Option | What it does |
|---|---|
| Classic | Classic's formula: 7.5 × damage ÷ 230.6 at level 60 |
| Forever v2 | WoW: Forever's rate × weapon speed per landed swing (3.46 main hand, 1.73 off hand, ×1.5 with Dual Wield Specialization). Crits ×2; damage is ignored; misses and dodges give nothing |
| Curved | Classic rage up to a threshold, then a smooth curve toward a per-swing cap. Both scale with hasted swing time; off hand ×0.625, crits ×2, Windfury swings ×0.75 |
| Curved + Modified Classic rage coefficient | Curved, but the part below the threshold uses a **Modified Classic rage coefficient** of your choice instead of 7.5 (rage = c × damage ÷ 230.6). This tunes early level-60 rage without moving the cap |

The Curved settings (threshold k, cap, sharpness p, off-hand and Windfury factors, Modified Classic rage coefficient, and the optional M_ref attack-table cap) sit in their own section. They only apply to the two Curved formulas.

### Talent and ability options (Classic tab)

| Setting | Default | Used for |
|---|---|---|
| Bloodthirst AP coeff / flat dmg | 0.45 / 0 | Testing Bloodthirst nerfs |
| Whirlwind off-hand hit | No | Whirlwind hitting with both weapons. Each hit rolls separately, without the dual-wield miss penalty, and the off-hand hit can't proc Windfury |
| Whirlwind rage cost | 25 | 22 with Forever's Raging Blows |
| Flurry haste % / charges | talent / 3 | e.g. 25% for 3 swings (Forever) or 35% for 2 swings |
| Death Wish dmg % / duration | 20 / 30 | e.g. 15% |
| Execute cooldown (s) | 0 | e.g. 4 |
| UW % (5/5) | 40 | 60 in Forever |
| UW mechanics | Classic | Classic procs on white swings and Heroic Strike/Cleave; Forever only on white swings |
| Deep Wounds mechanics | Classic | Classic: a crit refreshes one bleed (60% of main-hand weapon damage incl. attack power over 12 s). Forever: each crit adds a new instance (60% of main-hand weapon damage, no attack power) paid over the next 4 ticks; instances stack and ticks cannot crit |
| Furious Precision OH hit % | 0 | 10 for Forever's 3/3 talent |

### Test stats

- Bonus hit % and bonus crit %.
- Boss dodge reduction, for stress-testing the rage ceiling.

The sidebar and results page always show which rage formula and options are active, so screenshots record the setup.

## Sources

- Forever's rage rules come from Marrow's *Eternal Compendium of Dragonslaying* and Blizzard's WoW: Forever beta notes, as of 1 October 2026.
- Everything else, including gear, buffs, talents and the core simulation, is Guybrush's original work.

## Self-hosting and contributing

See the original [CONTRIBUTING.md](CONTRIBUTING.md). The site is static, so serving the folder (or GitHub Pages) is enough to run it. You can also open the HTML files straight from disk: the sim then runs on the page instead of in background workers, which is slower.

## Credits

Forked from [WarriorSim](https://github.com/GuybrushGit/WarriorSim) by **Guybrush-Golemagg**. This fork is maintained by **Speak-Grobbulus**.
