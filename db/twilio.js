const twilio = require('twilio');
const db     = require('../db/index');    
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { 
    emailTemplate,
    textTemplate
}            = require('../db/generateTemplate');
// twilio CONFIG *********
const client = new twilio(process.env.accountSid, process.env.authToken);

async function dailyUpdate () {
    try {
        // before sending update CHECK for likely error in the scraping process
        let theatreSql = 'SELECT * FROM theatre;'
        const theatreCheck = await db.query(theatreSql);
        // if detected by a less than 7 theatre check - stop 
        if (theatreCheck.rows.length !== 7 ) {
            console.log('TWILIO controller detects that there are less than 7 theatres in the database BOY! : ', theatreCheck.rows);
            // kill process and dont send updates
            return;
        }

        // since the data passed the test for accuracy - go on and update
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

// CHECK for underscraping - and likely error
async function scrapingErrorEmail(theatre, err) {
    try { 
        // send email
        const msg = {
            to: process.env.personalEmail,
            from: `IST Admin <${process.env.myEmail}>`,
            subject: 'SCRAPING ERROR !',
            html: `get ur ass onto heroku u bum - no ones getting updates dont worry ${ theatre }. ERROR: ${ err }`
        }
        await sgMail.send(msg);      
        return console.log('EMAIL SENT scraping error');      
    } catch (err) {
        console.log('TWILIO scraping error: ', err);
    }
};


module.exports = { 
    dailyUpdate,
    scrapingErrorEmail
};