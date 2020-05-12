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
async function seedDB() {
    try {
      console.log('SEEDING BEGINS:');
      // remove seeding
      await deleteSeeds();
      // begin seeding
      await getCinesphere();
      await getRegent();
      await getTiff();
      await getRoyal();
      await getParadise();
      await getRevue();
      await getHotDocs();  
    } catch(err) {
      let error = err.message;
  
      if(error.includes('Navigation timeout of 30000 ms exceeded')) {
        console.log('RESEED timeout error: ', error); 
        return seedDB();
      }

      if(error.includes('Cannot read property') && error.includes('querySelectorAll') && error.includes('null')) {
        console.log('RESEED querySelectorALL error: ', error);
        return seedDB();
      }
      console.log('THERE WAS AN ERROR NOT CAUGHT by my if(error): ', err);
    }
};

module.exports = seedDB(); 