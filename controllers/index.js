const db               = require('../db/index')
    , crypto           = require('crypto');
    
const sgMail           = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
    // GET landing page
    async getLanding (req, res, next) {
        let theatreQuery = 'SELECT * FROM theatre';
        let screeningQuery = 'SELECT * FROM screening';
        
        const { rows } = await db.query(theatreQuery);
        const result = await db.query(screeningQuery);
    
        console.log('ROWCOUNT: ', result.rowCount);
    
        return res.render("index", { 
            title: 'IST',
            screenings: result.rows,
            theatres: rows,
            screeningCount: result.rowCount
        });  
    }, 
    // GET verification page 
    async getVerification(req, res, next) {
        let sql = 'SELECT * FROM "user" WHERE verify_token = $1 AND verify_token_expires > $2';
        let params = [
            req.params.token,
            Date.now()
        ];
        const { rows } = await db.query(sql, params);

        const user = rows[0];

        if(!user) {
            req.session.error = 'Password reset token is invalid or has expired';
            return res.redirect('/');
        } 

        return res.render('verify', {
            title: "Subscribe",
            user: user
        });    
    },
    // POST send verification email or text 
    async postVerification (req, res, next) {
        try {
            const { email } = req.body;

            const token = await crypto.randomBytes(20).toString('hex');

            let sql = 'INSERT INTO "user" (created_date, verify_token_expires, verify_token, email) VALUES ($1, $2, $3, $4) returning *';
            let params = [
                Date.now(),
                Date.now() + 3600000,
                token,
                email
            ];
            await db.query(sql, params);

            const msg = {
                to: email,
                from: `IST Admin <${process.env.myEmail}>`,
                subject: 'Verify your email!',
                text:`Hi there,

                Thanks for signing up for Independent Screenings Toronto! Before we get started, we just need to confirm this is you.
                
                http://${req.headers.host}/users/verify/${token}

                If you did not request this, please ignore this email and your data 
                will be removed.`,
                html: `<p>Hi there,</p>

                <p>Thanks for signing up for Independent Screenings Toronto! Before we get started, we just need to confirm this is you.</p>
                
                <p><a href="http://${req.headers.host}/users/verify/${token}">Click here</a></p>

                <p>If you did not request this, please ignore this email and your data 
                will be removed.</p>`
            }
            await sgMail.send(msg);

            req.session.success = `Success. Just one thing: to start receiving updates, we need to verify your email address ${email}. Please check your email for a verification link.`;
            res.redirect('/');
        } catch (err) {
            const { email } = req.body;
            let error = err.message;

            if(error.includes('duplicate') && error.includes('violates unique constraint "user_email_key"')) {
                error = `A user with that email ${email} is already registered. To edit subscription, click link in the  top right :)`
            }        

            req.session.error = error;
            res.redirect('back');
        }
    },
    // PUT subscription
    async putSubscription (req, res, next) {
        try {
            // set values from form to psql table appropriate values
            if(req.body.number == '') {
                req.body.number = null;
            }
            if(req.body.number === null && req.body.textUpdate === 'on') {
                req.session.error = "You must provide a phone number to prefer text updates. Try again.";
                return res.redirect('back');
            }

            let sql = 'UPDATE "user" SET created_date = $1, text_update = $2, number = $3, verify_token_expires = $4, verify_token = $5, paused = $6 WHERE email = $7 returning *';
            let params = [
                Date.now(),
                req.body.textUpdate, 
                req.body.number,
                null,
                null,
                0,
                req.body.email
            ];
            const { rows } = await db.query(sql, params);

            const msg = {
                to: req.body.email,
                from: `IST Admin <${process.env.myEmail}>`,
                subject: 'Welcome!',
                html: `<p>Thanks for signing up!</p>
                <p>A few things: </p>
                <ul>
                    <li>Daily updates will be sent out at 10:00am EST</li>
                    <li>The updates can be muted anytime for a week, a month, or indefinitely <a href="http://${req.headers.host}/users/verify-edit">here</a></li>
                    <li>If you selected text updates we recommend you mute the conversation</li>
                    <li>Feedback can be sent to ${ process.env.myEmail }</li>
                </ul>`
            }
            await sgMail.send(msg);

            req.session.success = `Successfully registered, welcome ${ rows[0].email }!`;
            res.redirect('/');
        } catch (err) {
            const { number } = req.body;
            let error = err.message;

            if (error.includes('duplicate') && error.includes('violates unique constraint "user_number_key"')) {
                error = `A user with phone number ${number} is already registered`
            }            

            req.session.error = error;
            res.redirect('back');
        }
    },
    // GET edit verify page 
    getVerifyEdit (req, res, next) {
        res.render('verifyEdit', {
            title: 'Verify to edit'
        })
    },
    // POST verify to edit subscirption 
    async putVerifyEdit (req, res, next) {
        const { email } = req.body;

        // check for user with given email 
        let userSql = 'SELECT * FROM "user" WHERE email = $1';
        let userParams = [
            email
        ];
        const { rows } = await db.query(userSql, userParams);
        const user = rows[0];
        // if user doesnt exist redirect 
        if (!user) {
            req.session.error = `The email ${email} does not exist in our records`;
            return res.redirect('back');
        };

        // since user exists - proceed to send email and perform query update
        const token = await crypto.randomBytes(20).toString('hex');

        let sql = 'UPDATE "user" SET created_date = $1, verify_token_expires = $2, verify_token = $3 WHERE email = $4 returning *';
        let params = [
            Date.now(),
            Date.now() + 3600000,
            token,
            email
        ];
        await db.query(sql, params);

        const msg = {
            to: email,
            from: `IST Admin <${process.env.myEmail}>`,
            subject: 'Verify your email!',
            text: `Hi there,

            Click the link below to edit your subscription.
            
            http://${req.headers.host}/users/edit-subscription/${token}

            If you did not request this, please ignore this email and your data 
            will be removed.`,
            html: `<p>Hi there,</p>

            <p>Click the link below to edit your subscription.</p>
            
            <p><a href="http://${req.headers.host}/users/edit-subscription/${token}">Here</a></p>

            <p>If you did not request this, please ignore this email and your data 
            will be removed.</p>`
        }
        await sgMail.send(msg);

        req.session.success = `Success. Just one thing: to edit your subscription, we need to verify your email address ${email}. Please check your email.`;
        res.redirect('/');    
    },
    // GET edit subscription page
    async getEditSubscription (req, res, next) {
        const { token } = req.params;
        let sql = 'SELECT * FROM "user" WHERE verify_token = $1';
        let params = [
            token
        ];
        const { rows } = await db.query(sql, params);
        const user = rows[0];

        if(!user) {
            req.session.error = 'Something went wrong on our end. Your verification link from our email may have expired.';
            return res.redirect('back');
        }

        res.render('editSubscription', {
            title: 'Edit subscription',
            user: user
        });    
    },
    // POST edit subscription
    async putEditSubscription (req, res, next) {
        // set values from form to psql table appropriate values
        console.log(req.body);
        if(req.body.number == '') {
            req.body.number = null;
        }
        let paused;
        if(req.body.paused === 'snooze for a week') {
            paused = Date.now() + 604800000;
        }
        if(req.body.paused === 'snooze for 1 month') {
            paused = Date.now() + 2419200000;
        }    
        if(!req.body.paused) {
            paused = 0;
        }
        // check if number provided for textUpdate option
        if(req.body.number === null && req.body.textUpdate === 'on') {
            req.session.error = "You must provide a phone number to prefer text updates. Try again.";
            return res.redirect('back');
        }
        // check for user
        let checkUser = 'SELECT * FROM "user" WHERE email = $1';
        let checkParams = [req.body.email];
        const result = await db.query(checkUser, checkParams);
        const user = result.rows[0];

        if(!user) {
            req.session.error = 'That email is not in our records';
            return res.redirect('back');
        }
        // update user!
        let sql = 'UPDATE "user" SET paused = $1, created_date = $2, number = $4, text_update = $5, verify_token_expires = $6, verify_token = $7 WHERE email = $3 returning *';
        let params = [
            paused,
            Date.now(),
            req.body.email, 
            req.body.number,
            req.body.textUpdate,
            null,
            null
        ];
        const results = await db.query(sql, params);
        const updatedUser = results.rows[0];

        // account for possible combinations of req.body values returned from form
        if(req.body.number && req.body.textUpdate === 'on' && !req.body.paused) {
            req.session.success = `Your will now receive updates to ${ updatedUser.number }`;
            return res.redirect('/');        
        }

        if(req.body.textUpdate && req.body.paused) {
            req.session.success = `Your updates will ${ req.body.paused } and then you will begin receiving updates to ${ updatedUser.number }`;
            return res.redirect('/');        
        }

        req.session.success = `Your updates will ${ req.body.paused }`;
        return res.redirect('/');
    },
    // POST unsubscribe
    async putUnsubscription (req, res, next) {
        let sql = 'DELETE FROM "user" WHERE email = $1 returning *';
        let params =  [ req.body.email ];

        const { rows } = await db.query(sql, params);
        const user = rows[0];

        if(!user) {
            req.session.error = 'The email you provided is either not in our records, or something went wrong on our end.';
            return res.redirect('back');
        }
        req.session.success = `Successfully unsubscribed ${ user.email }, sorry to see you go :(`;
        res.redirect('/');    
    }
}