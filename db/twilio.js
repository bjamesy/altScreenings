const twilio            = require('twilio');
const db                = require('../db/index');    
const sgMail            = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { 
    emailTemplate,
    textTemplate
}                       = require('../db/generateTemplate');
// twilio CONFIG *********
const client            = new twilio(process.env.accountSid, process.env.authToken);

async function dailyUpdate () {
    try {
        let screeningSql = 'SELECT * FROM theatre INNER JOIN screening ON theatre.id = screening.theatre_id ORDER BY name;';
        const result = await db.query(screeningSql);
        const screenings = result.rows;

        let userSql = 'SELECT * FROM "user" WHERE paused <= $1';
        let userParams = [ Date.now() ];
        const results = await db.query(userSql, userParams);
        const users = results.rows;
        
        // generate email content
        const emailContent = emailTemplate(screenings);
        const textContent = textTemplate(screenings);

        for(const user of users) {
            if(user.verify_token_expires && user.verify_token_expires < user.created_date) {
                let sql = 'DELETE FROM "user" WHERE id = $1';
                let params = [user.id];

                await db.query(sql, params);
            }    
            if(user.text_update) {
                // SMS 
                console.log(textContent.toString());
                const message = await client.messages.create({
                    to: user.number,  
                    from: process.env.twilioNumber,
                    body: textContent.toString()
                })
                console.log(message.sid);                
            } else {
                // EMAIL    
                console.log(user.email);
                const msg = {
                    to: user.email,
                    from: `IST Admin <${process.env.myEmail}>`,
                    subject: 'Todays Independent Screenings in Toronto!',
                    html: emailContent.toString()
                }
                await sgMail.send(msg);            
            }
        }
    } catch (err) {
        console.log('TWILIO ERROR:', err); 
    }
};

module.exports = { dailyUpdate };