const deleteSeeds = require('../db/seedQueries');
const { 
    getRoyal, 
    getParadise, 
    getRevue,
    getHotDocs,
    getRegent,
    getTiff,
    getCinesphere
} = require('./seeds/seed');

  // SeedDB scraping all sites 
async function seedDB(next) {
    try {
      // remove seeding
      await deleteSeeds();
      // begin seeding
      await getCinesphere(next);
      await getRegent(next);
      await getTiff(next);
      await getRoyal(next);
      await getParadise(next);
      await getRevue(next);
      await getHotDocs(next);  
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
seedDB();  