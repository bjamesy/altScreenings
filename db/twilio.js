const twilio = require('twilio');
const db = require('../db/index');    
const sgMail     = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// twilio CONFIG *********
const client = new twilio(process.env.accountSid, process.env.authToken);

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
                            from: process.env.twilioNumber // From a valid Twilio number
                        })
                        console.log(message.sid);            
                    }    
                } else {
                    // EMAIL OPTION 
                    for(const row of rows) {
                        const msg = {
                            to: user.email,
                            from: `PTST Admin <${process.env.myEmail}>`,
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