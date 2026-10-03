importScripts(
    './data/buffs.min.js?v=ragenorm10',
    './data/enchants.min.js?v=ragenorm10',
    './data/levelstats.min.js?v=ragenorm10',
    './data/spells.min.js?v=ragenorm10',
    './data/talents.min.js?v=ragenorm10',
    './classes/player.min.js?v=ragenorm10',
    './classes/simulation.min.js?v=ragenorm10',
    './classes/spell.min.js?v=ragenorm10',
    './classes/weapon.min.js?v=ragenorm10',
    './globals.min.js?v=ragenorm10',
);

onmessage = (event) => {
    const params = event.data;
    if (params.globals.sod) importScripts('./data/gear_sod.min.js?v=ragenorm10','./data/runes.min.js?v=ragenorm10');
    else importScripts('./data/gear.min.js?v=ragenorm10');
    updateGlobals(params.globals);
    const player = new Player(...params.player);
    const sim = new Simulation(player, (report) => {
        // Finished
        if (params.fullReport) {
            report.player = player.serializeStats();
            report.spread = sim.spread;
        }
        postMessage([TYPE.FINISHED, report]);
    }, (iteration, report) => {
        // Update
        postMessage([TYPE.UPDATE, iteration, report]);
    }, params.sim);
    sim.startSync();
};

