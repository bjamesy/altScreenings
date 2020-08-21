const { scrapingErrorEmail } = require('../db/twilio');

module.exports = {
    errorHandler: (fn) => 
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
               .catch(next);
    },
    seedErrorHandler: async function(err, theatre, rerun, i) {
        let error = err.message;

        if(i >= 3) {
            console.log(i);

            await scrapingErrorEmail(theatre, error);
            console.log('rerun limit met/exceeded !');
            return;
        }    
        if(error.includes('Navigation timeout of 30000 ms exceeded') && i < 3) {
            console.log(`RESEED ${theatre} timeout error ${i}: `, error); 
            i++;
            rerun(i);
        }
        if(error.includes('Cannot read property') && error.includes('querySelectorAll') && error.includes('null') && i < 3) {
            console.log(`RESEED ${theatre} querySelectorALL error ${i}: `, error);
            i++;
            rerun(i);
        }            
        else {
            await scrapingErrorEmail(theatre, error);
            console.log(`${theatre} exception ERROR: `, error);
        }                
    }
};