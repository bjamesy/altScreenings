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
      console.log('SEEDING BEGINS:');
      // remove seeding
      deleteSeeds();
      // begin seeding
      getCinesphere();
      getRegent();
      getTiff();
      getRoyal();
      getParadise();
      getRevue();
      getHotDocs();  
};

module.exports = { seedDB }; 