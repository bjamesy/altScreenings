const twitter = require('twitter');
const db = require('./index');
const { twitterTemplate } = require('./generateTemplate');

const client = new twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

async function twitterUpdate () {
    try {
        let sql = 'SELECT * FROM theatre';
        const result = await db.query(sql);
        const theatres = result.rows;
        // check to see if theatre result has a return of less than 7 rows and therefore indicates an error in the scraping process
        if(theatres.length !== 7) {
            console.log('insufficient scraping test FAILED - will not TWEET');
            // kill processes
            return;
        } 
        let screenings = [];

        // forEach loop  wouldnt work here since i was running asyncronous processes inside of it 
        for(const theatre of theatres) {
            // if no screenings -> kill process and move on to next element 
            if(theatre.no_screenings) {
                console.log(`${theatre.name} has no corresponding screenings`);
                continue;
            }
            // if theatre.no_screenings is null then carry on with query of screenings
            let screeningSql = 'SELECT * FROM screening WHERE theatre_id = $1';
            let params = [ theatre.id ];

            let { rows } = await db.query(screeningSql, params);     
            
            console.log('THEATRE with screenings: ', theatre.name);
            rows.forEach(row => {
                screenings.push(theatre);
                screenings.push(row);
                const tweeter = twitterTemplate(screenings);
                console.log('TWEETER :', tweeter);
                client.post('statuses/update', { status: tweeter },  function(err, tweet, response) {
                    console.log('TWEET: ', tweet.text);  // Tweet body.
                    if(err) {
                        console.log('ERROR: ', err); // Error
                    }
                });            
                screenings = [];
            });
        };
    } catch (err) {
        console.log('TWITTER ERROR: ', err);
    }    
}

module.exports = { twitterUpdate };  