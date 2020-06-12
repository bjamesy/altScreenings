const twitter = require('twitter');
const db = require('./index');
const { twitterTemplate } = require('./generateTemplate');

var client = new twitter({
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
        let screenings = [];

        // forEach loop  wouldnt work here since i was running asyncronous processes inside of it 
        // - 
        for(const theatre of theatres) {
            // if no screenings -> kill process and move on to next element 
            if (theatre.no_screenings) {
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
                const tweet = twitterTemplate(screenings);
                client.post('statuses/update', { status: tweet },  function(err, tweet, response) {
                    console.log('TWEET: ', tweet);  // Tweet body.
                    if(err) {
                        console.log(err); // Error
                    }
                });            
                screenings = [];
            });
        };
    } catch (err) {
        console.log(err);
    }    
}

module.exports = { twitterUpdate };  