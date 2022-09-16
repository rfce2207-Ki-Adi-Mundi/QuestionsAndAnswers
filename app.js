const db = require('./db/index.js');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
let app = express();
module.exports.app = app;

const port = process.env.PORT || 8080;

//MIDDLEWARE
app.use(cors());
app.use(morgan('dev'));

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

app.get('/qa/questions', (req, res) => { //IT MAY BE FASTER TO MAKE PRODUCT_ID INTO VARCHAR IN TABLE SCHEMA
  let product = parseInt(req.query.product_id);
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.count) || 10;
  let info = {
    product_info: product,
  };
  if (limit > 50) {
    limit = 50;
  }; //SELECT ONLY INFO YOU NEED, THEN ADD ANOTHRE QUERY TO ADD ANSWERS TO INFO OBJECT
  db.query(`SELECT * from questions where product_id = ${product} order by questions.helpful desc limit ${limit} offset ${(page - 1) * 10};`, (err, result) => {
    if (err) {
      res.sendStatus(400);
      console.log(err);
    }
    info.results = result.rows
    res.status(200).json(info);
    console.log(info);
  });
})
