const express = require('express');
const router = express.Router();

const { 
    putSubscription,
    putUnsubscription,
    postVerification,
    getVerification,
    getEditSubscription,
    putEditSubscription,
    getVerifyEdit,
    putVerifyEdit
} = require('../controllers/index.js')

// GET verification page
router.get('/verify/:token', getVerification);

// POST verification
router.post('/verify', postVerification);

// UPDATE subscription
router.put('/subscribe/:token', putSubscription);

// GET pause subscription
router.get('/editSubscription/:token', getEditSubscription);

// POST paused subscription
router.put('/editSubscription', putEditSubscription);

// GET edit verification
router.get('/verifyEdit', getVerifyEdit);

// POST edit verification 
router.post('/verifyEdit', putVerifyEdit);

// UPDATE cancellation 
router.put('/unsubscribe', putUnsubscription);

module.exports = router;