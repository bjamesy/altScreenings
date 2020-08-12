const { scrapingErrorEmail } = require('../db/twilio');

module.exports = {
    errorHandler: (fn) => 
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
               .catch(next);
    },
    seedErrorHandler: async function(err, theatre, rerun, i) {
        let error = err.message;
        if(i >= 4) {
            console.log(i);

            scrapingErrorEmail();
            return console.log('rerun limit met/exceeded !');
        }    

        if(error.includes('Navigation timeout of 30000 ms exceeded') && i < 4) {
            console.log(`RESEED ${theatre} timeout error ${i}: `, error); 
            i++;
            return rerun(i);
        }
    
        if(error.includes('Cannot read property') && error.includes('querySelectorAll') && error.includes('null') && i < 4) {
            console.log(`RESEED ${theatre} querySelectorALL error ${i}: `, error);
            i++;
            return rerun(i);
        }                            
    }
};