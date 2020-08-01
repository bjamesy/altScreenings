const { deleteSeeds } = require('../db/seedQueries');
const db              = require('../db/index');
const sgMail          = require('@sendgrid/mail');
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
    let seedPromises = [
        // remove seeding
        deleteSeeds(),
        // begin seeding
        getCinesphere(0),
        getRegent(0),
        getTiff(0),
        getRoyal(0),
        getParadise(0),
        getRevue(0),
        getHotDocs(0) 
    ];

    // When seeding Promises and db work done - then check 
    Promise.all(seedPromises).then(() => { 
        underScrapingCheck();
    })    
};

// CHECK for underscraping - and likely error
async function underScrapingCheck() {
    let theatreSql = 'SELECT * FROM theatre;'
    const theatreCheck = await db.query(theatreSql);
    // if detected by a less than 7 theatre check - notify me
    if(theatreCheck.rows.length !== 7 ) {
        console.log('TWILIO controller detects that there are less than 7 theatres in the database BOY! : ');
        // send email
        const msg = {
            to: process.env.personalEmail,
            from: `IST Admin <${process.env.myEmail}>`,
            subject: 'SCRAPING ERROR !',
            html: 'get ur ass onto heroku u bum - no ones getting updates dont worry'
        }
        await sgMail.send(msg);      
        return;
    }    
}

module.exports = { seedDB }; 