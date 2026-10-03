# WarriorSim: Rage Norm

A fork of [Guybrush's WarriorSim](https://github.com/GuybrushGit/WarriorSim), the WoW Classic and Season of Discovery warrior DPS simulator. This fork adds tools for studying how rage generation shapes warrior damage. It's extended for the design proposal [A Better Trade for Normalized Rage](https://github.com/speak-gg/warrior-rage-proposal).

**Live sim:** https://speak-gg.github.io/guybrushsim-rage-norm/classic.html

## What this fork adds

All additions are in the **Fight** settings panel. With everything at its default, the sim behaves exactly like the original.

### Rage tracking

- A **Rage Generated** table that breaks rage down by source: auto attacks by hand and outcome, Windfury swings, Unbridled Wrath, Bloodrage, Anger Management and refunds.
- A **rage budget** that accounts for every point of rage: what was generated, what was spent, what overflowed the 100 cap, and what was left over.
- **True RPM**, which counts the rage from white swings that Heroic Strike replaced, plus Heroic Strike's real rage cost.

### Rage formulas

The **Rage Normalization** dropdown picks the formula used for white-hit rage:

| Option | What it does |
|---|---|
| Off (Classic) | Classic's formula: 7.5 × damage ÷ 230.6 at level 60 |
| On (Curved) | **Curved rage.** Classic rage up to a threshold, then a smooth curve toward a per-swing cap. Both scale with hasted swing time; off hand ×0.625, crits ×2, Windfury swings ×0.75. Parameters: threshold k, cap, sharpness p. There's an optional attack-table cap (M_ref) |
| Forever v0 / v1 / v2 | WoW: Forever's rate × weapon speed per landed swing (3.46 main hand, 1.73 off hand). Damage is ignored; misses and dodges give nothing. Versions differ in the off-hand bonus from Dual Wield Specialization (×2 / ×1 / ×1.5) and the crit bonus (×1 / ×1.75 / ×2) |

### Forever talents

| Setting | Effect |
|---|---|
| Forever UW % (5/5) | Unbridled Wrath proc chance; procs only on white swings, never Heroic Strike or Cleave |
| Furious Precision OH hit % | Extra off-hand hit (4 / 7 / 10 at 1 / 2 / 3 points) |
| Forever talents (1/0) | Applies the two settings above with Classic or Curved rage too. They're always on in the Forever modes |

### Ability variants

| Setting | Classic default | Used for |
|---|---|---|
| Bloodthirst AP coeff / flat dmg | 0.45 / 0 | Testing Bloodthirst nerfs |
| Whirlwind off-hand hit (1/0) | 0 | Whirlwind hitting with both weapons. Each hit rolls separately, without the dual-wield miss penalty, and the off-hand hit can't proc Windfury |
| Whirlwind rage cost | 25 | 22 with Forever's Raging Blows |
| Flurry haste % / charges | talent / 3 | e.g. 25% for 3 swings (Forever) or 35% for 2 swings (the proposal) |
| Death Wish dmg % / duration | 20 / 30 | e.g. 15% |
| Execute cooldown (s) | 0 | e.g. 4 |

### Test stats

- Bonus hit % and bonus crit %.
- Boss dodge reduction, for stress-testing the rage ceiling.

The sidebar and results page always show which rage formula and variants are active, so screenshots record the setup.

## Sources

- Forever's rage rules come from Marrow's *Eternal Compendium of Dragonslaying* and Blizzard's WoW: Forever beta notes, as of 1 October 2026.
- Everything else, including gear, buffs, talents and the core simulation, is Guybrush's original work.

## Self-hosting and contributing

See the original [CONTRIBUTING.md](CONTRIBUTING.md). The site is static, so serving the folder (or GitHub Pages) is enough to run it.

## Credits

WarriorSim by [Guybrush](https://github.com/GuybrushGit/WarriorSim). Curved rage and WoW: Forever additions by speak-gg.
