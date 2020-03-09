const twilio = require('twilio');
const db = require('../db/index');    
const sgMail     = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// twilio CONFIG *********
const client = new twilio(process.env.accountSid, process.env.authToken);

module.exports = {
    // daily updates for users 
    async dailyUpdate () {
        try {
            // come up with a better QUERY HERE 
            let screeningSql = 'SELECT name, title, link, showtime FROM theatre INNER JOIN screening ON theatre.id = screening.theatre_id ORDER BY name;';
            const { rows } = await db.query(screeningSql);

            let userSql = 'SELECT * FROM "user" WHERE user.paused <= $1';
            let userParams = [ Date.now() ];
            const results = await db.query(userSql, userParams);
            const users = results.rows;
            
            for(const user of users) {
                if(user.verify_token_expires < user.created_date) {
                    let sql = 'DELETE FROM "user" WHERE id = $1';
                    let params = [user.id];

                    await db.query(sql, params);
                }
                if(user.textupdate) {
                    // SMS 
                    for(const row of rows) {
                        const message = await client.messages.create({
                            body: `${row.name}, ${row.title}, ${row.link}, ${row.showtime}
                            
                            Unsubscribe or snooze here: http://${req.headers.host}/users/pause`,
                            to: user.number,  
                            from: process.env.twilioNumber 
                        })
                        console.log(message.sid);            
                    }    
                } else {
                    // EMAIL  
                    for(const row of rows) {
                        const msg = {
                            to: user.email,
                            from: `PTST Admin <${process.env.myEmail}>`,
                            subject: 'Todays Independent Screenings Toronto!',
                            text: `${row.name}, ${row.title}, ${row.link}, ${row.showtime}
                            
                            Unsubscribe or snooze here: http://${req.headers.host}/users/pause`
                        }
                        await sgMail.send(msg);            
                    }    
                }
            }
        } catch (err) {
            console.log('ERROR:', err); 
        }
    }
}