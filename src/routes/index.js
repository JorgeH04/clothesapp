const express = require('express');
const router = express.Router();
const Img = require('../models/image');



router.get('/', async (req, res) => {
  res.render('portada');
});




module.exports = router;
