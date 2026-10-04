importScripts(
    './data/buffs.min.js?v=ragenorm14',
    './data/enchants.min.js?v=ragenorm14',
    './data/levelstats.min.js?v=ragenorm14',
    './data/spells.min.js?v=ragenorm14',
    './data/talents.min.js?v=ragenorm14',
    './classes/player.min.js?v=ragenorm14',
    './classes/simulation.min.js?v=ragenorm14',
    './classes/spell.min.js?v=ragenorm14',
    './classes/weapon.min.js?v=ragenorm14',
    './globals.min.js?v=ragenorm14',
);

onmessage = (event) => {
    const params = event.data;
    if (params.globals.sod) importScripts('./data/gear_sod.min.js?v=ragenorm14','./data/runes.min.js?v=ragenorm14');
    else importScripts('./data/gear.min.js?v=ragenorm14');
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

