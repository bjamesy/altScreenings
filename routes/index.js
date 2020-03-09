const express = require('express');
const router  = express.Router();
const { getLanding } = require('../controllers/index');

/* GET home page. */
router.get('/', getLanding);

module.exports = router;