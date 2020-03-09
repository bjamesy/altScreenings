const express = require('express');
const router = express.Router();

const { getSubscription,
putSubscription,
getUnsubscription,
putUnsubscription,
postVerification,
getVerification,
getPause,
postPause
} = require('../controllers/index.js')

// GET verification page
router.get('/verify/:token', getVerification);

// POST verification
router.post('/verify', postVerification);

// UPDATE subscription
router.put('/subscribe/:token', putSubscription);

// GET pause subscription
router.get('/pause', getPause);

// POST paused subscription
router.put('/pause', postPause);

// GET cancellation
// protect this page with a token middleware - token provided in link (email/number)
router.get('/unsubscribe', getUnsubscription);

// UPDATE cancellation 
router.put('/unsubscribe', putUnsubscription);

module.exports = router;