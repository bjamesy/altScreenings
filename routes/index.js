const express = require('express');
const router  = express.Router();
const db      = require('../db/index');

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    let sql = 'SELECT * FROM theatre LEFT OUTER JOIN screening ON theatre.id = screening.theatre_id ORDER BY name';
    const { rows, rowCount } = await db.query(sql);

    console.log(rowCount);

    return res.render("index", { 
      title: 'PTST',
      screenings: rows,
      screeningCount: rowCount
    });  
  } catch(err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;