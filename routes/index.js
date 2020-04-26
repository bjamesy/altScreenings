const express = require('express');
const router  = express.Router();
const { getLanding } = require('../controllers/index');
const { errorHandler } = require('../middleware/index');
 
/* GET home page. */
router.get('/', errorHandler(getLanding));

module.exports = router;