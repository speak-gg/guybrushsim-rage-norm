var SIM = SIM || {}

SIM.STATS = {

    init: function () {
        var view = this;
        view.variables();
        view.events();
    },

    variables: function () {
        var view = this;
        view.body = $('body');
        view.stats = view.body.find('section.stats');
        view.dmg = view.stats.find('.container-dmg canvas');
        view.dmglegend = view.stats.find('.container-dmg').siblings('.legend');
        view.aura = view.stats.find('.container-aura canvas');
        view.spread = view.stats.find('.container-spread canvas');
        view.colors = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'];
        view.close = view.stats.find('.btn-close');
        view.table = view.stats.find('.container-table');
        view.ragetable = view.stats.find('.container-rage');
    },

    events: function () {
        var view = this;

        view.close.click(function (e) {
            e.preventDefault();
            $('.js-stats').removeClass('active');
            $('section.stats').removeClass('active');
            view.body.addClass('sidebar-mobile-open');
        });
    },

    initCharts: function (sim) {
        var view = this;
        $('.js-stats').removeClass('disabled');
        view.buildTable(sim);
        view.buildRageTable(sim);
        view.buildData(sim);
        view.buildAuras();
        view.buildDamage();
        view.buildSpread();
    },

    buildData: function (sim) {
        var view = this;

        // Auras
        let counter = 0;
        let data = [];
        let colors = [];
        view.auradata = {
            labels: [],
            datasets: []
        };
        for (let name in sim.player.auras) {
            let aura = sim.player.auras[name];
            if (!aura.uptime) continue;
            view.auradata.labels.push(aura.name);
            data.push(Math.min((aura.uptime / sim.totalduration / 10).toFixed(2), 100));
            colors.push(view.colors[counter % view.colors.length]);
            counter++;
        }
        view.auradata.datasets.push({
            data: data,
            fill: false,
            backgroundColor: colors,
        });

        // Damage
        counter = 0;
        data = [];
        colors = [];
        view.dmgdata = {
            labels: [],
            datasets: []
        };
        for (let name in sim.player.spells) {
            let spell = sim.player.spells[name];
            if (!spell.totaldmg) continue;
            view.dmgdata.labels.push(spell.name);
            data.push((spell.totaldmg / sim.totalduration).toFixed(2));
            colors.push(view.colors[counter % view.colors.length]);
            counter++;
        }

        // MH
        view.dmgdata.labels.push('Main Hand');
        data.push((sim.player.mh.totaldmg / sim.totalduration).toFixed(2));
        colors.push(view.colors[counter % view.colors.length]);
        counter++;
        if (sim.player.mh.totalprocdmg) {
            view.dmgdata.labels.push('Main Hand Proc');
            data.push((sim.player.mh.totalprocdmg / sim.totalduration).toFixed(2));
            colors.push(view.colors[counter % view.colors.length]);
            counter++;
        }

        // OH
        if (sim.player.oh) {
            view.dmgdata.labels.push('Off Hand');
            data.push((sim.player.oh.totaldmg / sim.totalduration).toFixed(2));
            colors.push(view.colors[counter % view.colors.length]);
            counter++;
            if (sim.player.oh.totalprocdmg) {
                view.dmgdata.labels.push('Off Hand Proc');
                data.push((sim.player.oh.totalprocdmg / sim.totalduration).toFixed(2));
                colors.push(view.colors[counter % view.colors.length]);
                counter++;
            }
        }

        // DW
        if (sim.player.auras.deepwounds && sim.player.auras.deepwounds.totaldmg) {
            view.dmgdata.labels.push(sim.player.auras.deepwounds.name);
            data.push((sim.player.auras.deepwounds.totaldmg / sim.totalduration).toFixed(2));
            colors.push(view.colors[counter % view.colors.length]);
        }
        if (sim.player.auras.deepwounds2 && sim.player.auras.deepwounds2.totaldmg) {
            view.dmgdata.labels.push(sim.player.auras.deepwounds2.name);
            data.push((sim.player.auras.deepwounds2.totaldmg / sim.totalduration).toFixed(2));
            colors.push(view.colors[counter % view.colors.length]);
        }
        if (sim.player.auras.deepwounds3 && sim.player.auras.deepwounds3.totaldmg) {
            view.dmgdata.labels.push(sim.player.auras.deepwounds3.name);
            data.push((sim.player.auras.deepwounds3.totaldmg / sim.totalduration).toFixed(2));
            colors.push(view.colors[counter % view.colors.length]);
        }
        if (sim.player.auras.deepwounds4 && sim.player.auras.deepwounds4.totaldmg) {
            view.dmgdata.labels.push(sim.player.auras.deepwounds4.name);
            data.push((sim.player.auras.deepwounds4.totaldmg / sim.totalduration).toFixed(2));
            colors.push(view.colors[counter % view.colors.length]);
        }

        // Rend
        if (sim.player.auras.rend && sim.player.auras.rend.totaldmg) {
            view.dmgdata.labels.push(sim.player.auras.rend.name);
            data.push((sim.player.auras.rend.totaldmg / sim.totalduration).toFixed(2));
            colors.push(view.colors[counter % view.colors.length]);
        }

        // weapon bleed
        if (sim.player.auras.weaponbleedmh && sim.player.auras.weaponbleedmh.totaldmg) {
            view.dmgdata.labels.push(sim.player.auras.weaponbleedmh.name);
            data.push((sim.player.auras.weaponbleedmh.totaldmg / sim.totalduration).toFixed(2));
            colors.push(view.colors[counter % view.colors.length]);
        }
        if (sim.player.auras.weaponbleedoh && sim.player.auras.weaponbleedoh.totaldmg) {
            view.dmgdata.labels.push(sim.player.auras.weaponbleedoh.name);
            data.push((sim.player.auras.weaponbleedoh.totaldmg / sim.totalduration).toFixed(2));
            colors.push(view.colors[counter % view.colors.length]);
        }



        view.dmgdata.datasets.push({
            data: data,
            fill: false,
            backgroundColor: colors,
        });

        data = [];
        view.spreaddata = {
            labels: [],
            datasets: []
        };

        for(let i in sim.spread) {
            view.spreaddata.labels.push(i);
            data.push(sim.spread[i]);
        }

        view.spreaddata.datasets.push({
            data: data,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
            fill: 'origin'
        });

    },

    buildAuras: function () {
        var view = this;

        if (view.aurachart) view.aurachart.destroy();
        view.aurachart = new Chart(view.aura, {
            type: 'horizontalBar',
            data: view.auradata,
            showTooltips: false,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false,
                    align: 'center',
                    fullWidth: true
                },
                tooltips: {
                    enabled: false,
                },
                hover: {
                    mode: null
                },
                title: {
                    display: false,
                    text: 'Aura Uptime',
                    fontColor: '#ccc',
                    position: 'bottom'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: '#ccc',
                        },
                        gridLines: {
                            display: false
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            display: false,
                        },
                        gridLines: {
                            display: false
                        }
                    }]
                },
                animation: {
                    onComplete: function () {
                        var chartInstance = this.chart;
                        var ctx = this.chart.ctx;
                        this.data.datasets.forEach(function (dataset, i) {
                            var meta = chartInstance.controller.getDatasetMeta(i);
                            meta.data.forEach(function (bar, index) {
                                var data = dataset.data[index];
                                ctx.fillStyle = "#ddd";
                                ctx.shadowOffsetX = 2;
                                ctx.shadowOffsetY = 2;
                                ctx.shadowColor = "rgba(0,0,0,0.5)";
                                ctx.shadowBlur = 4;
                                ctx.fillText(data + '%', parseInt(data) < 11 ? bar._model.x + 10 : bar._model.x - 50, bar._model.y + 5);
                            });
                        });
                    }
                }
            },

        });
    },

    buildDamage: function () {
        var view = this;

        if (view.dmgchart) view.dmgchart.destroy();
        view.dmgchart = new Chart(view.dmg, {
            type: 'pie',
            data: view.dmgdata,
            options: {
                elements: {
                    arc: {
                        borderWidth: 1,
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: false,
                    text: 'DPS',
                    fontColor: '#ccc',
                    position: 'bottom'
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                },
                legend: {
                    display: false,
                    position: 'bottom',
                    labels: {
                        fontColor: '#ccc',
                    }
                },
                tooltips: {
                    callbacks: {
                        label: (item, obj) => ` ${obj.labels[item.index]}: ${obj.datasets[0].data[item.index]} DPS`,
                    }
                },
            }
        });

        view.dmglegend.html(view.dmgchart.generateLegend());
    },

    buildTable: function (sim) {
        var view = this;
        view.table.empty();
        let html = '<table><thead><tr><th>Action</th><th>Hit %</th><th>Crit %</th><th>Miss %</th><th>Dodge %</th><th>Glance %</th><th>Uses</th><th>DPR</th><th>DPS</th></tr></thead><tbody>';


        let i = sim.iterations;
        let shown = sim.player.mh.totaldmg + (sim.player.oh ? sim.player.oh.totaldmg : 0);
        let data = sim.player.mh.data;
        let total = data.reduce((a, b) => a + b, 0);
        let dps = (sim.player.mh.totaldmg / sim.totalduration).toFixed(2);
        html += `<tr><td>Main Hand</td><td>${(data[0] / total * 100).toFixed(2)}</td><td>${(data[3] / total * 100).toFixed(2)}</td><td>${(data[1] / total * 100).toFixed(2)}</td><td>${(data[2] / total * 100).toFixed(2)}</td><td>${(data[4] / total * 100).toFixed(2)}</td><td>${(total / i).toFixed(2)}</td><td></td><td>${dps}</td></tr>`;

        if (sim.player.oh) {
            data = sim.player.oh.data;
            total = data.reduce((a, b) => a + b, 0);
            dps = (sim.player.oh.totaldmg / sim.totalduration).toFixed(2);
            html += `<tr><td>Off Hand</td><td>${(data[0] / total * 100).toFixed(2)}</td><td>${(data[3] / total * 100).toFixed(2)}</td><td>${(data[1] / total * 100).toFixed(2)}</td><td>${(data[2] / total * 100).toFixed(2)}</td><td>${(data[4] / total * 100).toFixed(2)}</td><td>${(total / i).toFixed(2)}</td><td></td><td>${dps}</td></tr>`;
        }
        
        for (let name in sim.player.spells) {
            let n = sim.player.spells[name].name;
            let data = sim.player.spells[name].data;
            let total = data.reduce((a, b) => a + b, 0);
            if (!total) continue;
            shown += sim.player.spells[name].totaldmg;
            let dps = (sim.player.spells[name].totaldmg / sim.totalduration).toFixed(2);
            let dpr = ((sim.player.spells[name].totaldmg / i) / (sim.player.spells[name].cost * (total / i))).toFixed(2);
            if (name == "slam" && sim.player.bloodsurge)
                dpr = Infinity;
            if (name == "execute")
                dpr = ((sim.player.spells[name].totaldmg / i) / ((sim.player.spells[name].cost * (total / i)) + (sim.player.spells[name].totalusedrage / i))).toFixed(2);
            // Rage-stats build: use the rage actually spent (tracked per ability and merged across workers),
            // net of miss/dodge refunds. For Execute this includes the extra rage it consumes on hit.
            // Heroic Strike / Cleave also replace a white swing: count only the damage they add over that swing
            // and charge them the white swing rage they give up.
            let sp = sim.ragespent && sim.ragespent[n];
            if (sp) {
                let ref = 0;
                for (const key in sim.ragesrc || {}) {
                    const [g, d] = key.split('|');
                    if (g.indexOf('Ability Refunds') === 0 && d && d.replace(/ \((Miss|Dodge)\)$/, '') === n) ref += sim.ragesrc[key].gen;
                }
                let dmg = sim.player.spells[name].totaldmg;
                let cost = sp.rage + sp.extra - ref;
                let o = sim.hsopp && sim.hsopp[n];
                if (o && o.n) {
                    dmg += (o.ohdmg || 0) + (o.wfdmg || 0) - o.forgonedmg;
                    cost += o.forgone - (o.selfrage || 0) - (o.ohrage || 0) - (o.wfrage || 0);
                    n += ' <span title="DPR = (damage − expected replaced white swing damage + extra off hand and Windfury damage) ÷ true rage cost (spent − refunds + white rage forgone − own rage − extra off hand and Windfury rage)" style="opacity:.6">(net)</span>';
                }
                dpr = cost > 0 ? (dmg / cost).toFixed(2) : Infinity;
            }
            html += `<tr><td>${n}</td><td>${(data[0] / total * 100).toFixed(2)}</td><td>${(data[3] / total * 100).toFixed(2)}</td><td>${(data[1] / total * 100).toFixed(2)}</td><td>${(data[2] / total * 100).toFixed(2)}</td><td>${(data[4] / total * 100).toFixed(2)}</td><td>${(total / i).toFixed(2)}</td><td>${dpr}</td><td>${dps}</td></tr>`;
        }

        if (sim.player.auras.rend) {
            let data = sim.player.auras.rend.data;
            let total = data.reduce((a, b) => a + b, 0);
            let totaldmg = sim.player.auras.rend.totaldmg;
            let dps = (totaldmg / sim.totalduration).toFixed(2);
            shown += totaldmg;
            let dpr = ((totaldmg / i) / (sim.player.auras.rend.cost * (total / i))).toFixed(2);
            let rsp = sim.ragespent && sim.ragespent[sim.player.auras.rend.name];
            if (rsp && rsp.rage > 0) dpr = (totaldmg / rsp.rage).toFixed(2);
            html += `<tr><td>${sim.player.auras.rend.name}</td><td></td><td></td><td>${(data[1] / total * 100).toFixed(2)}</td><td>${(data[2] / total * 100).toFixed(2)}</td><td></td><td>${(total / i).toFixed(2)}</td><td>${dpr}</td><td>${dps}</td></tr>`;
        }


        // Procs and periodic damage that count toward total DPS but have no ability row
        // (same sources as the damage chart and the simulation's total damage).
        const dotRow = (label, dmg) => {
            if (!dmg) return;
            shown += dmg;
            html += `<tr><td>${label}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>${(dmg / sim.totalduration).toFixed(2)}</td></tr>`;
        };
        dotRow('Main Hand Proc', sim.player.mh.totalprocdmg);
        if (sim.player.oh) dotRow('Off Hand Proc', sim.player.oh.totalprocdmg);
        for (const k of ['deepwounds', 'deepwounds2', 'deepwounds3', 'deepwounds4', 'weaponbleedmh', 'weaponbleedoh']) {
            const a = sim.player.auras[k];
            if (a && a.totaldmg) dotRow(a.name, a.totaldmg);
        }
        // Anything else in the total (e.g. spells with damage but no recorded hits)
        const other = sim.totaldmg - shown;
        if (Math.abs(other / sim.totalduration) >= 0.01) dotRow('Other', other);
        html += '</tbody><tfoot>';
        html += `<tr><td><b>Total</b></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><b>${(sim.totaldmg / sim.totalduration).toFixed(2)}</b></td></tr>`;
        html += '</tfoot></table>';


        view.table.append(html);
        view.table.find('table').tablesorter({
            widthFixed: true,
        });
    },

    // Macro view: the big chunks of rage that add up to the whole, per fight.
    buildRageBudget: function (sim, G, O, i, secs, fmt) {
        const spent = sim.ragespent || {}, opp = sim.hsopp || {};
        const refunds = {};
        for (const key in sim.ragesrc || {}) {
            const [g, d] = key.split('|');
            if (g.indexOf('Ability Refunds') !== 0 || !d) continue;
            const nm = d.replace(/ \((Miss|Dodge)\)$/, '');
            refunds[nm] = (refunds[nm] || 0) + sim.ragesrc[key].gen;
        }
        const gross = nm => spent[nm] ? spent[nm].rage + spent[nm].extra : 0;
        const hsNames = Object.keys(opp).filter(nm => opp[nm].n > 0);
        const isHS = nm => hsNames.includes(nm);
        const hsGross = hsNames.reduce((a, nm) => a + gross(nm), 0);
        const hsRef = hsNames.reduce((a, nm) => a + (refunds[nm] || 0), 0);
        const hsForg = hsNames.reduce((a, nm) => a + opp[nm].forgone, 0);
        const hsCred = hsNames.reduce((a, nm) => a + (opp[nm].selfrage || 0) + (opp[nm].ohrage || 0) + (opp[nm].wfrage || 0), 0);
        const otherNames = Object.keys(spent).filter(nm => !isHS(nm) && gross(nm) > 0);
        const otherGross = otherNames.reduce((a, nm) => a + gross(nm), 0);
        const L = sim.totalragestancelost || 0, E = sim.totalrageend || 0;
        const hsLabel = hsNames.join(' / ') || 'Heroic Strike';

        const pct = (v, t) => t ? fmt(v / t * 100, 1) + '%' : '';
        const row = (label, v, t, opts = {}) => {
            const style = opts.bold ? 'font-weight:700;' : '';
            const pad = opts.sub ? 'padding-left:18px;opacity:.8;' : '';
            return `<tr style="${style}"><td style="${pad}">${label}</td><td>${fmt(v / i, 1)}</td><td>${fmt(v / secs, 2)}</td><td>${opts.nopct ? '' : pct(v, t)}</td></tr>`;
        };
        const colors = ['#c0392b', '#2980b9', '#8e44ad', '#7f8c8d', '#27ae60', '#95a5a6'];
        const bar = (parts, t) => '<div style="display:flex;height:16px;margin:4px 0 10px;border-radius:3px;overflow:hidden">' +
            parts.filter(p => p[1] > 0).map((p, k) => `<div title="${p[0]}: ${fmt(p[1] / i, 1)} (${pct(p[1], t)})" style="width:${p[1] / t * 100}%;background:${colors[k % colors.length]}"></div>`).join('') + '</div>' +
            '<div style="font-size:11px;opacity:.8;margin-bottom:6px">' + parts.filter(p => p[1] > 0).map((p, k) => `<span style="display:inline-block;width:9px;height:9px;background:${colors[k % colors.length]};margin:0 4px 0 10px"></span>${p[0]} ${pct(p[1], t)}`).join('') + '</div>';
        const head = title => `<table class="rage-table rage-budget-table" style="margin-bottom:4px"><thead><tr><th>${title}</th><th>Rage / Fight</th><th>Rage / Sec</th><th>% of Total</th></tr></thead><tbody>`;

        // Actual: rage that entered the bar and where it went
        const actualOut = hsGross + otherGross + O + L + E;
        const residA = G - actualOut;
        let html = '<div style="display:flex;gap:28px;flex-wrap:wrap;margin-bottom:14px">';
        html += '<div style="flex:1;min-width:420px">' + head('Actual rage (what the sim generated)');
        html += row('<b>Rage generated</b> (incl. refunds, before cap)', G, G, { bold: true });
        html += row(hsLabel + ' spent', hsGross, G);
        html += row('Other abilities spent', otherGross, G);
        for (const nm of otherNames.sort((a, b) => gross(b) - gross(a))) html += row(nm, gross(nm), G, { sub: true });
        html += row('Overflow (lost to 100 cap)', O, G);
        if (L) html += row('Lost on stance swap', L, G);
        html += row('Left at end of fight', E, G);
        html += row('Unaccounted', residA, G, { nopct: false });
        html += '</tbody></table>';
        html += bar([[hsLabel, hsGross], ['Other abilities', otherGross], ['Overflow', O], ['Stance swap', L], ['End of fight', E]], G);
        html += '</div>';

        // True: include the white swing rage HS/Cleave give up
        if (hsNames.length) {
            const T = G - hsCred - hsRef + hsForg;
            const hsTrue = hsGross - hsRef + hsForg - hsCred;
            html += '<div style="flex:1;min-width:420px">' + head('True rage (incl. ' + hsLabel + ' opportunity cost)');
            html += row('Rage generated', G, T, { nopct: true });
            html += row('− ' + hsLabel + ' own rage (UW, extra off hand, Windfury)', hsCred, T, { sub: true, nopct: true });
            html += row('− ' + hsLabel + ' refunds', hsRef, T, { sub: true, nopct: true });
            html += row('+ White swing rage given up', hsForg, T, { sub: true, nopct: true });
            html += row('<b>True rage generated</b>', T, T, { bold: true });
            html += row(hsLabel + ' true cost', hsTrue, T);
            html += row('spent − refunds', hsGross - hsRef, T, { sub: true });
            html += row('+ white swing rage given up − own rage', hsForg - hsCred, T, { sub: true });
            html += row('Other abilities spent', otherGross, T);
            html += row('Overflow (lost to 100 cap)', O, T);
            if (L) html += row('Lost on stance swap', L, T);
            html += row('Left at end of fight', E, T);
            html += row('Unaccounted', T - hsTrue - otherGross - O - L - E, T);
            html += '</tbody></table>';
            html += bar([[hsLabel + ' true cost', hsTrue], ['Other abilities', otherGross], ['Overflow', O], ['Stance swap', L], ['End of fight', E]], T);
            html += '</div>';
        }
        html += '</div>';
        const rn = sim.player.ragenorm;
        const va = sim.player.variants || {}; const vl = [];
        if (va.btap != 0.45 || va.btflat) vl.push(`Bloodthirst ${va.btap} × AP${va.btflat ? ' + ' + va.btflat : ''}`);
        if (va.wwoh) vl.push('Whirlwind also hits with the off hand');
        if (va.wwcost != 25) vl.push(`Whirlwind costs ${va.wwcost} rage`);
        const uw = sim.player.uwcfg || { pct: 40, mech: 'classic' };
        if (mode != 'forever' && (uw.pct != 40 || uw.mech != 'classic')) vl.push(`Unbridled Wrath ${uw.pct}% (${uw.mech == 'forever' ? 'Forever mechanics: white swings only' : 'Classic mechanics'})`);
        if (mode != 'forever' && sim.player.dwmech == 'forever') vl.push('Deep Wounds: Forever mechanics (each crit stacks a new instance of main hand weapon damage, no AP, over the next 4 ticks)');
        if (mode != 'forever' && sim.player.fphit) vl.push(`Furious Precision +${sim.player.fphit}% off-hand hit`);
        if (va.flurryhaste || va.flurrycharges != 3) vl.push(`Flurry ${va.flurryhaste || 'talent'}% for ${va.flurrycharges} swings`);
        if (va.dwdmg != 20 || va.dwdur != 30) vl.push(`Death Wish ${va.dwdmg}% for ${va.dwdur}s`);
        if (va.execd) vl.push(`Execute ${va.execd}s cooldown`);
        if (vl.length && mode != 'forever') html += `<div style="font-size:13px;margin:-4px 0 10px"><b style="color:#d9a33b">Ability variants:</b> ${vl.join(', ')}</div>`;
        const cs = sim.player.custom || {};
        if (cs.hit || cs.crit || cs.dodgered) html += `<div style="font-size:13px;margin:-4px 0 10px"><b style="color:#6c6">Custom stats:</b> +${cs.hit}% hit, +${cs.crit}% crit, boss dodge −${cs.dodgered}%</div>`;
        const fv = sim.player.forever;
        if (fv) html += `<div style="font-size:13px;margin:-4px 0 10px"><span style="color:#fff;background:#36c;padding:1px 6px;border-radius:3px;font-weight:bold">FOREVER RAGE v${fv.ver}</span> Each landed white swing gives rate × weapon speed (3.46 main hand, 1.73 off hand × ${['2', '1', '1.5'][fv.ver]} with Dual Wield Specialization), crits × ${['1', '1.75', '2'][fv.ver]}, damage ignored, misses and dodges give nothing. Unbridled Wrath ${uw.pct}% (${uw.mech == 'forever' ? 'white swings only' : 'Classic mechanics'}), Furious Precision off hand +${sim.player.fphit || 0}% hit.${mode == 'forever' ? ` Forever tab rules: Bloodthirst 45% AP, Flurry 25% for 3 swings, Whirlwind hits with both hands for ${va.wwcost} rage, Death Wish 20% for 30 s, no Execute cooldown, Deep Wounds stacks (main hand weapon damage only, no AP; ticks cannot crit).` : ''} Source: Marrow's Eternal Compendium ("Rage Generation", "Rage on Crit").</div>`;
        else html += rn
            ? `<div style="font-size:13px;margin:-4px 0 10px"><span style="color:#fff;background:#b33;padding:1px 6px;border-radius:3px;font-weight:bold">${rn.modc ? 'CURVED + MODIFIED CLASSIC RAGE COEFFICIENT' : 'CURVED RAGE'}</span> White-hit rage uses ${rn.modc ? `Curved + Modified Classic rage coefficient (coefficient ${rn.coef}; Classic uses 7.5)` : 'Curved rage'}: Classic up to ${rn.k} × swing time, smooth cap ${rn.cap} rage per hasted second (p ${rn.p}), off hand × ${rn.oh}, crits × 2, Windfury swings × ${rn.wf}.${rn.tablecap ? ` Table cap on: cap × min(1, M_ref ÷ M), M_ref ${rn.mrefmh} MH / ${rn.mrefoh} OH, Recklessness and Elune's Light crit excluded.` : ''} "Main Hand Windfury" rows are Windfury extra attacks.</div>`
            : `<div style="font-size:13px;margin:-4px 0 10px;opacity:.8">Rage formula: Classic. "Main Hand Windfury" rows are Windfury extra attacks.</div>`;
        html += `<div style="font-size:12px;opacity:.7;margin:-6px 0 14px">Per fight averages. "Unaccounted" should be ~0; it checks that every rage gain and spend is tracked. Other abilities' refunds are counted in Rage generated, so their spend is shown before refunds. True rage generated is the rage you would have generated with the swings ${hsLabel} replaced left as white swings (a potential, not rage you could have spent: much of it would overflow).</div>`;
        return html;
    },

    buildRageTable: function (sim) {
        var view = this;
        view.ragetable.empty();
        if (!sim.ragesrc) return;
        const i = sim.iterations, secs = sim.totalduration;
        const fmt = (v, d = 2) => (v === null || v === undefined || isNaN(v) || !isFinite(v)) ? '' : v.toFixed(d);

        // group entries: key = "Group|Detail"
        const groups = {};
        for (const key in sim.ragesrc) {
            const [g, d] = key.split('|');
            const e = sim.ragesrc[key];
            const grp = groups[g] || (groups[g] = { n: 0, casts: 0, gen: 0, over: 0, details: [] });
            grp.n += e.n; grp.casts += e.casts; grp.gen += e.gen; grp.over += e.over;
            if (d) grp.details.push(Object.assign({ name: d }, e));
        }
        const totalgen = Object.values(groups).reduce((a, g) => a + g.gen, 0);
        const totalover = Object.values(groups).reduce((a, g) => a + g.over, 0);

        const row = (name, e, cls) => `<tr class="${cls}">` +
            `<td>${name}</td>` +
            `<td>${e.casts ? fmt(e.casts / i) : ''}</td>` +
            `<td>${fmt(e.n / i)}</td>` +
            `<td>${e.casts ? fmt(e.gen / e.casts) : ''}</td>` +
            `<td>${fmt(e.gen / e.n)}</td>` +
            `<td>${fmt(e.gen / i)}</td>` +
            `<td>${fmt(e.gen / secs, 3)}</td>` +
            `<td>${fmt(e.over / i)}</td>` +
            `<td>${fmt(e.gen / totalgen * 100)}</td></tr>`;

        let html = '<table class="rage-table"><thead><tr><th>Source</th><th>Casts / Fight</th><th>Events / Fight</th><th>Rage / Cast</th><th>Rage / Event</th><th>Avg Rage / Fight</th><th>Rage / Sec</th><th>Overflow / Fight</th><th>% of Total</th></tr></thead><tbody>';
        const sorted = Object.entries(groups).sort((a, b) => b[1].gen - a[1].gen);
        for (const [g, grp] of sorted) {
            html += row(g, grp, 'rage-group');
            if (grp.details.length > 1 || (grp.details.length == 1 && grp.details[0].name)) {
                grp.details.sort((a, b) => b.gen - a.gen);
                for (const d of grp.details) html += row('<span style="padding-left:18px;opacity:.8">&#8627; ' + d.name + '</span>', d, 'rage-detail');
            }
        }
        html += '</tbody><tfoot>';
        html += `<tr><td><b>Total generated</b></td><td></td><td></td><td></td><td></td><td><b>${fmt(totalgen / i)}</b></td><td><b>${fmt(totalgen / secs, 3)}</b></td><td><b>${fmt(totalover / i)}</b></td><td>100.00</td></tr>`;
        html += `<tr><td>Lost to 100 rage cap</td><td></td><td></td><td></td><td></td><td>${fmt(totalover / i)}</td><td>${fmt(totalover / secs, 3)}</td><td></td><td>${fmt(totalover / totalgen * 100)}</td></tr>`;
        if (sim.totalrageend !== undefined)
            html += `<tr><td>Rage left at end of fight</td><td></td><td></td><td></td><td></td><td>${fmt(sim.totalrageend / i)}</td><td>${fmt(sim.totalrageend / secs, 3)}</td><td></td><td>${fmt(sim.totalrageend / totalgen * 100)}</td></tr>`;
        if (sim.totalragestancelost)
            html += `<tr><td>Lost on stance swap</td><td></td><td></td><td></td><td></td><td>${fmt(sim.totalragestancelost / i)}</td><td>${fmt(sim.totalragestancelost / secs, 3)}</td><td></td><td>${fmt(sim.totalragestancelost / totalgen * 100)}</td></tr>`;
        html += '</tfoot></table>';

        // Rage Spent: every ability that consumed rage, with refunds and the HS/Cleave white swing opportunity cost
        const spent = sim.ragespent || {};
        const opp = sim.hsopp || {};
        const refunds = {};
        for (const key in sim.ragesrc) {
            const [g, d] = key.split('|');
            if (g.indexOf('Ability Refunds') !== 0 || !d) continue;
            const nm = d.replace(/ \((Miss|Dodge)\)$/, '');
            refunds[nm] = (refunds[nm] || 0) + sim.ragesrc[key].gen;
        }
        const names = Object.keys(spent).filter(k => spent[k].n > 0 || spent[k].extra > 0);
        if (names.length) {
            const rows = names.map(nm => {
                const e = spent[nm], o = opp[nm];
                const gross = e.rage + e.extra, ref = refunds[nm] || 0, net = gross - ref, forg = o ? o.forgone : 0;
                const cred = o ? (o.selfrage || 0) + (o.ohrage || 0) + (o.wfrage || 0) : 0;
                return { nm, casts: e.n, gross, extra: e.extra, ref, net, forg, cred, trueCost: net + forg - cred };
            }).sort((x, y) => y.net - x.net);
            const tot = rows.reduce((t, r) => { for (const k of ['casts', 'gross', 'extra', 'ref', 'net', 'forg', 'cred', 'trueCost']) t[k] += r[k]; return t; },
                { casts: 0, gross: 0, extra: 0, ref: 0, net: 0, forg: 0, cred: 0, trueCost: 0 });
            const cell = (v, show, d = 2) => `<td>${show ? fmt(v, d) : ''}</td>`;
            const srow = (r, bold) => {
                const tr = bold ? '<tr class="rage-group">' : '<tr>';
                return tr + `<td>${r.nm}</td>` + cell(r.casts / i, true) + cell(r.gross / i, true) + cell(r.ref / i, r.ref > 0) + cell(r.net / i, true) +
                    cell(r.casts ? r.net / r.casts : NaN, r.casts > 0) + cell(r.forg / i, r.forg > 0) + cell(r.cred / i, r.cred > 0) + cell(r.trueCost / i, true) +
                    cell(r.casts ? r.trueCost / r.casts : NaN, r.casts > 0) + cell(r.net / secs, true, 3) + cell(r.net / tot.net * 100, true) + '</tr>';
            };
            html += '<table class="rage-table rage-spent-table" style="margin-top:16px"><thead><tr><th>Rage Spent</th><th>Casts / Fight</th><th>Spent / Fight</th><th>Refunded / Fight</th><th>Net Spent / Fight</th><th>Net / Cast</th><th>White Rage Forgone / Fight</th><th>Rage Credits / Fight</th><th>True Cost / Fight</th><th>True Cost / Cast</th><th>Net Rage / Sec</th><th>% of Net Spent</th></tr></thead><tbody>';
            for (const r of rows) html += srow(r, false);
            html += '</tbody><tfoot>' + srow(Object.assign({ nm: '<b>Total spent</b>' }, tot), true);
            // Remove rage that only exists because HS/Cleave were used (their own UW/FA rage, extra off hand
            // and Windfury rage, and their miss/dodge refunds) before adding back the forgone white rage.
            const hsRefunds = Object.keys(opp).reduce((a, nm) => a + (refunds[nm] || 0), 0);
            const gainedNoHS = totalgen - tot.cred - hsRefunds + tot.forg;
            html += `<tr><td>Rage generated</td><td></td><td></td><td></td><td>${fmt(totalgen / i)}</td><td></td><td></td><td></td><td></td><td></td><td>${fmt(totalgen / secs, 3)}</td><td></td></tr>`;
            if (tot.forg > 0) {
                html += `<tr><td>Rage generated if HS/Cleave swings were white</td><td></td><td></td><td></td><td>${fmt(gainedNoHS / i)}</td><td></td><td></td><td></td><td></td><td></td><td>${fmt(gainedNoHS / secs, 3)}</td><td></td></tr>`;
                html += `<tr><td>Forgone white rage, % of rage generated</td><td></td><td></td><td></td><td>${fmt(tot.forg / totalgen * 100)}%</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
            }
            html += '</tfoot></table>';
            html += `<div style="font-size:12px;opacity:.7;margin-top:6px">Spent includes rage Execute consumes beyond its base cost. Refunded is the 80% cost refund on misses and dodges (also listed under Rage Generated). ` +
                `A queued Heroic Strike or Cleave replaces the main hand white swing, so that swing's rage is lost: White Rage Forgone is the expected rage of the replaced swing (same attack table and rage formula as a real white hit, before the 100 cap, so part of it would have overflowed anyway). Rage Credits = rage the ability generates itself (Unbridled Wrath, Frenzied Assault) plus the extra off hand rage from off hand swings that lose the dual wield miss penalty while it is queued, plus the rage from extra Windfury procs. True Cost = Net Spent + White Rage Forgone − Rage Credits.</div>`;

            // Per cast comparison: queued HS/Cleave vs the white swing it replaces
            const cmp = Object.entries(opp).filter(([nm, o]) => o.n > 0);
            if (cmp.length) {
                const spellByName = nm => Object.values(sim.player.spells || {}).find(x => x.name == nm);
                html += '<table class="rage-table rage-hs-table" style="margin-top:16px"><thead><tr><th>Per cast vs replaced white swing</th>' +
                    cmp.map(([nm]) => `<th>${nm}</th>`).join('') + '</tr></thead><tbody>';
                const line = (label, f, d = 2) => `<tr><td>${label}</td>` + cmp.map(([nm, o]) => `<td>${fmt(f(nm, o), d)}</td>`).join('') + '</tr>';
                const dmgOf = nm => (spellByName(nm) || {}).totaldmg || 0;
                const cost = (nm, o) => { const e = spent[nm] || { rage: 0, extra: 0 }; return e.rage + e.extra - (refunds[nm] || 0); };
                const netdmg = (nm, o) => dmgOf(nm) - o.forgonedmg + (o.ohdmg || 0) + (o.wfdmg || 0);
                const truec = (nm, o) => cost(nm, o) + o.forgone - (o.selfrage || 0) - (o.ohrage || 0) - (o.wfrage || 0);
                html += line('Ability damage', (nm, o) => dmgOf(nm) / o.n);
                html += line('− Expected white swing damage', (nm, o) => o.forgonedmg / o.n);
                html += line('+ Extra off hand damage (no DW miss while queued)', (nm, o) => (o.ohdmg || 0) / o.n);
                html += line('+ Extra Windfury damage (lands more often)', (nm, o) => (o.wfdmg || 0) / o.n);
                html += line('<b>= Net damage added</b>', (nm, o) => netdmg(nm, o) / o.n);
                html += line('Rage cost (net of refunds)', (nm, o) => cost(nm, o) / o.n);
                html += line('+ Expected white swing rage (incl. Unbridled Wrath)', (nm, o) => o.forgone / o.n);
                html += line('− Own rage (Unbridled Wrath, Frenzied Assault)', (nm, o) => (o.selfrage || 0) / o.n);
                html += line('− Extra off hand rage (no DW miss while queued)', (nm, o) => (o.ohrage || 0) / o.n);
                html += line('− Extra Windfury rage (lands more often)', (nm, o) => (o.wfrage || 0) / o.n);
                html += line('<b>= True rage cost</b>', (nm, o) => truec(nm, o) / o.n);
                html += line('<b>Net damage per rage</b>', (nm, o) => truec(nm, o) > 0 ? netdmg(nm, o) / truec(nm, o) : NaN);
                html += line('Off hand swings while queued', (nm, o) => (o.ohswings || 0) / o.n);
                html += line('Extra Windfury procs', (nm, o) => (o.wfprocs || 0) / o.n, 4);
                html += '</tbody></table>';
                html += `<div style="font-size:12px;opacity:.7;margin-top:6px">The replaced white swing uses the dual wield miss chance, can glance and does not get ability crit bonuses; Heroic Strike/Cleave use their own rolls (no dual wield penalty, no glancing). There is no parry or block in this sim. Windfury Totem: HS/Cleave land more often than the white swing, so they proc Windfury (20% per landed main hand attack while it is not active) more often; each extra proc is valued as one main hand white attack with the Windfury AP bonus. Not included: other extra procs from landing more often (weapon, trinket, Deep Wounds) and SoD Bloodsurge.</div>`;
            }
        }
        html += `<div style="font-size:12px;opacity:.7;margin-top:8px">Averages over ${i} fights (${fmt(secs / i, 1)}s average). Rage / Event and Rage / Cast are before the 100 cap; Overflow is the part of that rage lost to the cap. Casts are uses of an ability, item or proc; events include ticks and procs (e.g. Bloodrage's instant rage plus its 1 rage/sec ticks).</div>`;

        html = view.buildRageBudget(sim, totalgen, totalover, i, secs, fmt) + html;
        view.ragetable.append(html);
        view.ragetable.find('table').addClass('tablesorter-default');
        view.ragetable.find('tr.rage-group td').css('font-weight', 700);
        view.ragetable.find('tfoot td').css({ 'border-top': '1px solid #555' });
    },

    buildSpread: function () {
        var view = this;

        if (view.spreadchart) view.spreadchart.destroy();
        view.spreadchart = new Chart(view.spread, {
            type: 'bar',
            data: view.spreaddata,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                spanGaps: false,
                legend: {
                    display: false,
                },
                elements: {
                    line: {
                        tension: 0.4
                    },
                    point:{
                        radius: 0
                    }
                },
                plugins: {
                    filler: {
                        propagate: false
                    }
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero:true,
                            autoSkip: true,
                            maxRotation: 0
                        }
                    }],
                },
                tooltips: {
                    callbacks: {
                        label: (item, obj) => ` ${obj.labels[item.index]} DPS: ${obj.datasets[0].data[item.index]}`,
                    }
                },
            }
        });
    },
};