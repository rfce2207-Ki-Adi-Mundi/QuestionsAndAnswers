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
    product_id: product,
    results: []
  };
  if (limit > 50) {
    limit = 50;
  }; //SELECT ONLY INFO YOU NEED, THEN ADD ANOTHRE QUERY TO ADD ANSWERS TO INFO OBJECT
  db.query(`SELECT question_id, product_id, question_body, question_date, asker_name, question_helpfulness, questions.reported, answer_id, body, date, answerer_name, helpfulness from questions inner join answers on questions.question_id = answers.question where product_id = ${product} order by questions.question_helpfulness desc limit ${limit} offset ${(page - 1) * 10};`, (err, result) => {
    if (err) {
      res.sendStatus(400);
      console.log(err);
    }
    result.rows.forEach((object, index) => {
      if (!info.results.some(e => e.question_id === object.question_id)) {
        info.results.push({
          question_id: object.question_id,
          question_body: object.question_body,
          question_date: object.question_date,
          asker_name: object.asker_name,
          question_helpfulness: object.question_helpfulness,
          reported: !!object.reported,
          answers: {}
        });
        //add answers
      };
    });
    console.log(result.rows);
    res.status(200).json(info);
  });
})

// app.get('/qa/questions', (req, res) => { //IT MAY BE FASTER TO MAKE PRODUCT_ID INTO VARCHAR IN TABLE SCHEMA
//   let product = parseInt(req.query.product_id);
//   let page = parseInt(req.query.page) || 1;
//   let limit = parseInt(req.query.count) || 10;
//   db.query(`SELECT question_id, product_id, question_body, question_date, asker_name, question_helpfulness, questions.reported, answer_id, body, date, answerer_name, helpfulness from questions inner join answers on questions.question_id = answers.question where product_id = ${product} order by questions.question_helpfulness desc limit ${limit} offset ${(page - 1) * 10};`, (err, result) => {
//     if (err) {
//       res.sendStatus(400);
//       console.log(err);
//     }
//     res.status(200).json(result.rows);
//   });
// })