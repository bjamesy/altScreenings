const { deleteSeeds } = require('../db/seedQueries');
const { 
    getRoyal, 
    getParadise, 
    getRevue,
    getHotDocs,
    getRegent,
    getTiff,
    getCinesphere
} = require('../seeds/seed');

  // SeedDB scraping all sites 
function seedDB() {
    // remove seeding
    deleteSeeds();
    // begin seeding
    getCinesphere(0);
    getRegent(0);
    getTiff(0);
    getRoyal(0);
    getParadise(0);
    getRevue(0);
    getHotDocs(0);  
};

module.exports = { seedDB }; 