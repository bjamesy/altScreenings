const twilio            = require('twilio');
const db                = require('../db/index');    
const { emailTemplate } = require('../db/generateEmailTemplate');
const sgMail            = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// twilio CONFIG *********
const client            = new twilio(process.env.accountSid, process.env.authToken);

module.exports = {
    // daily updates for users 
    async dailyUpdate () {
        try {
            let screeningSql = 'SELECT * FROM theatre INNER JOIN screening ON theatre.id = screening.theatre_id ORDER BY name;';
            const result = await db.query(screeningSql);
            const screenings = result.rows;

            let userSql = 'SELECT * FROM "user" WHERE paused <= $1';
            let userParams = [ Date.now() ];
            const results = await db.query(userSql, userParams);
            const users = results.rows;
            
            // generate email content
            const content = emailTemplate(screenings);

            for(const user of users) {
                if(user.verify_token_expires && user.verify_token_expires < user.created_date) {
                    let sql = 'DELETE FROM "user" WHERE id = $1';
                    let params = [user.id];

                    await db.query(sql, params);
                }    
                if(user.text_update) {
                    // SMS 
                    for(const screening of screenings) {
                        const message = await client.messages.create({
                            to: user.number,  
                            from: process.env.twilioNumber,
                            body: `${screening.name}, ${screening.title}, ${screening.link}, ${screening.showtime}`
                        })
                        console.log(message.sid);                
                    }
                } else {
                    // EMAIL    
                    const msg = {
                        to: user.email,
                        from: `PTST Admin <${process.env.myEmail}>`,
                        subject: 'Todays Independent Screenings Toronto!',
                        html: content.toString(), 
                        text: 'something went wrong with email generation'
                    }
                    await sgMail.send(msg);            
                }
            }
        } catch (err) {
            console.log('TWILIO ERROR:', err); 
        }
    }
}
// ******** mock screenings for email generation ********
// const screenings = [
//   {
//       name: 'tiff',
//       title: 'portrait of a lady on fire',
//       link: 'www.lick_nuts.ca',
//       showtime: [
//           "8:00pm",
//           "9:00am"
//       ]
//   },
//   {
//       name: 'revue',
//       title: 'princess mananokai',
//       link: 'www.lick_testis.ca',
//       showtime: [
//           "8:00am",
//           "11:00am"
//       ]
//   }
// ]