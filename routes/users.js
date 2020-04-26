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
} = require('../controllers/index.js');
const { errorHandler } = require('../middleware/index');

// GET verification page
router.get('/verify/:token', errorHandler(getVerification));

// POST verification
router.post('/verify', errorHandler(postVerification));

// UPDATE subscription
router.put('/subscribe/:token', errorHandler(putSubscription));

// GET pause subscription
router.get('/edit-subscription/:token', errorHandler(getEditSubscription));

// POST paused subscription
router.put('/edit-subscription', errorHandler(putEditSubscription));

// GET edit verification
router.get('/verify-edit', getVerifyEdit);

// POST edit verification 
router.post('/verify-edit', errorHandler(putVerifyEdit));

// UPDATE cancellation 
router.put('/unsubscribe', errorHandler(putUnsubscription));

module.exports = router;