const express = require('express');
const router  = express.Router();
const db      = require('../db/index');
const { 
  getRoyal, 
  getParadise, 
  getRevue,
  getHotDocs,
  getRegent,
  getTiff,
  getTiffy
} = require('../seeds/seed');

/* GET home page. */
router.get('/', (req, res, next) => {
  // getParadise();
  // getRoyal();
  // getRevue();
  // getHotDocs();
  // getRegent();
  // getTiff();
  getTiffy();

  return res.render('index', { title: 'Express' });  
});

module.exports = router;