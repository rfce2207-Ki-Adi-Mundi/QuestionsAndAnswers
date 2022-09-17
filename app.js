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
  };
  db.query(`select question_id, product_id, question_body, question_date, asker_name, question_helpfulness, questions.reported, answers.answer_id, body, date, answerer_name, helpfulness from questions inner join answers on question_id = question where product_id = ${product} order by questions.question_helpfulness desc limit ${limit * 10} offset ${(page - 1) * 10};`, (err, result) => {
    if (err) {
      res.sendStatus(400);
      console.log(err);
    }
    result.rows.forEach( (object, index) => {
      db.query(`select json_agg(photos.url) from photos inner join answers on answers.answer_id = photos.answer_id where answers.answer_id = 5 `, (err, result) => {
        console.log(result.rows[0].json_agg);
      });
      if (!info.results.some(e => e.question_id === object.question_id)) {
      let answersObj = {};
      answersObj[object.answer_id] = {
        id: object.answer_id,
        body: object.body,
        date: object.date,
        answerer_name: object.answerer_name,
        helpfulness: object.helpfulness,
        photos: []
      };
      info.results.push({
        question_id: object.question_id,
        question_body: object.question_body,
        question_date: object.question_date,
        asker_name: object.asker_name,
        question_helpfulness: object.question_helpfulness,
        reported: !!object.reported,
        answers: answersObj
      });
      } else {
        let index = info.results.findIndex(elem => elem.question_id === object.question_id);
        info.results[index].answers[object.answer_id] = {
          id: object.answer_id,
          body: object.body,
          date: object.date,
          answerer_name: object.answerer_name,
          helpfulness: object.helpfulness,
          photos: []
          };
        };
    });
    console.log(result.rows);
    res.status(200).json(info);
  });
});

// app.get('/qa/questions', (req, res) => { //IT MAY BE FASTER TO MAKE PRODUCT_ID INTO VARCHAR IN TABLE SCHEMA
//   let product = parseInt(req.query.product_id);
//   let page = parseInt(req.query.page) || 1;
//   let limit = parseInt(req.query.count) || 10;
//   db.query(`select question_id, product_id, question_body, question_date, asker_name, question_helpfulness, questions.reported, answers.answer_id, body, date, answerer_name, helpfulness, url from questions inner join answers on question_id = question inner join photos on answers.answer_id = photos.answer_id where product_id = 1 order by questions.question_helpfulness desc limit 10 offset 0;`, (err, result) => {
//     if (err) {
//       res.sendStatus(400);
//       console.log(err);
//     }
//     let data = {};
//     data.first = result.rows;
//     db.query(`select json_agg(photos.url) from photos inner join answers on answers.answer_id = photos.answer_id where answers.answer_id = 5 `, (err, result) => {
//       data.photos = result.rows[0].json_agg;
//       res.status(200).json(data);
//     });
//   });
// })





// let mapResult = Promise.all(result.rows.map(async (object, index) => {
//   let items = await db.query(`select json_agg(photos.url) from photos inner join answers on answers.answer_id = photos.answer_id where answers.answer_id = 5 `, (err, result) => {
//     console.log(result.rows[0].json_agg);
//   });
//   if (!info.results.some(e => e.question_id === object.question_id)) {
//   let answersObj = {};
//   answersObj[object.answer_id] = {
//     id: object.answer_id,
//     body: object.body,
//     date: object.date,
//     answerer_name: object.answerer_name,
//     helpfulness: object.helpfulness,
//     photos: []
//   };
//   info.results.push({
//     question_id: object.question_id,
//     question_body: object.question_body,
//     question_date: object.question_date,
//     asker_name: object.asker_name,
//     question_helpfulness: object.question_helpfulness,
//     reported: !!object.reported,
//     answers: answersObj
//   });
//   } else {
//     let index = info.results.findIndex(elem => elem.question_id === object.question_id);
//     info.results[index].answers[object.answer_id] = {
//       id: object.answer_id,
//       body: object.body,
//       date: object.date,
//       answerer_name: object.answerer_name,
//       helpfulness: object.helpfulness,
//       photos: []
//       };
//     };
// }));