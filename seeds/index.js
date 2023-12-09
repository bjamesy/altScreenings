const { deleteSeeds } = require('../db/seedQueries');
const sgMail          = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { 
    getRoyal, 
    getParadise, 
    getRevue,
    getHotDocs,
    getRegent,
    getTiff,
    getCinesphere,
    getFox,
    getCarlton
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
    getFox(0);
    getCarlton(0);
};

module.exports = { seedDB }; 