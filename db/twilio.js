const twilio = require('twilio');
const db = require('../db/index');    
const sgMail     = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// twilio password - Jamesballanger#12
// twilio CONFIG *********
const accountSid = 'AC129efb3cf98ec4ac0b3b2ac61377f9d2'; // Your Account SID from www.twilio.com/console
const authToken = 'a2da36c53f4635b5f8b2ce963ad0503a';   // Your Auth Token from www.twilio.com/console

const client = new twilio(accountSid, authToken);

module.exports = {
    async sendText() {
        try {
            let userSql = 'SELECT number, email FROM "user"';
            let screeningSql = 'SELECT name, title, link, showtime FROM theatre INNER JOIN screening ON theatre.id = screening.theatre_id ORDER BY name;';
            const { rows } = await db.query(screeningSql);
            const results = await db.query(userSql);

            const users = results.rows;
            
            for(const user of users) {
                if(user.number) {
                    //SMS OPTION
                    for(const row of rows) {
                        const message = await client.messages.create({
                            body: `${row.title}, ${row.link}, ${row.showtime}`,
                            to: user.number,  // Text this number
                            from: '14697891866' // From a valid Twilio number
                        })
                        console.log(message.sid);            
                    }    
                } else {
                    // EMAIL OPTION 
                    for(const row of rows) {
                        const msg = {
                            to: user.email,
                            from: 'PTST Admin <james_ballanger_2@hotmail.com>',
                            subject: 'Todays Independent Screenings Toronto!',
                            text: `${row.title}, ${row.link}, ${row.showtime}`
                        };
                        await sgMail.send(msg);            
                        console.log(message.sid);            
                    }    
                }
            }
        } catch (err) {
            console.log('TEXT ERROR:', err); 
        }
    }
}