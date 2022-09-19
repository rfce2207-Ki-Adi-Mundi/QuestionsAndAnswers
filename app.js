const db = require('./db/index.js');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
let app = express();
const router = require('./routes.js');

module.exports.app = app;

const port = process.env.PORT || 8080;

//MIDDLEWARE
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`)
});

server.keepAliveTimeout = 49 * 1000;

// app.use('/qa', router);
//GET QUESTIONS
app.get('/qa/questions', async (req, res) => {
  let product = parseInt(req.query.product_id);
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.count) || 10;
  let answer_ids = [];
  let info = {
    product_id: product,
    results: []
  };
  if (limit > 50) {
    limit = 50;
  };
  await db.query(`select question_id, product_id, question_body, question_date, asker_name, question_helpfulness, questions.reported, answers.answer_id, body, date, answerer_name, helpfulness from questions inner join answers on question_id = question where product_id = ${product} order by questions.question_helpfulness desc limit ${limit * 10} offset ${(page - 1) * 10};`)
    .then( async (result) => {
      result.rows.forEach( async (object) => {
        answer_ids.push(object.answer_id);
        if (!info.results.some(e => e.question_id === object.question_id)) {
          let answersObj = {};
          answersObj[object.answer_id] = {
            id: object.answer_id,
            body: object.body,
            date: new Date(Number(object.date)).toISOString(),
            answerer_name: object.answerer_name,
            helpfulness: object.helpfulness,
            photos: []
          };
          info.results.push({
            question_id: object.question_id,
            question_body: object.question_body,
            question_date: new Date(Number(object.question_date)).toISOString(),
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
        })
        let photos = await db.query(`SELECT answer_id, url FROM photos WHERE answer_id in (${answer_ids})`);
        await info.results.forEach( (object) => {
          for (let key in object.answers) {
            photos.rows.forEach( (photo) => {
              if (key === '' + photo.answer_id) {
                object.answers[key].photos.push(photo.url);
              }
            })
          }
        });
        res.status(200).json(info);
        return;
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    })
});

//GET ANSWERS
app.get(`/qa/questions/:question_id/answers`, async (req, res) => {
  let question = parseInt(req.params.question_id);
  let count = 0;
  let info = {
    question: question,
    count: count,
    results: []
  };
  await db.query(`select answers.answer_id, body, date, answerer_name, helpfulness, reported, photo_id, url from answers full outer join photos on answers.answer_id = photos.answer_id where question = ${question} order by answers.helpfulness desc;`)
  .then(async (result) => {
    result.rows.forEach((object) => {
      if (!!object.reported) {
        return;
      }
      if (!info.results.some(e => e.answer_id === object.answer_id)) {
        let photosObj;
        if (object.url !== null) {
          photosObj = [{
            id: object.photo_id,
            url: object.url
          }];
        }
        info.results.push({
          answer_id: object.answer_id,
          body: object.body,
          date: new Date(Number(object.date)).toISOString(),
          answerer_name: object.answerer_name,
          helpfulness: object.helpfulness,
          photos: photosObj || []
        });
        info.count++;
        } else {
          let index = info.results.findIndex(elem => elem.answer_id === object.answer_id);
          info.results[index].photos.push({
            id: object.photo_id,
            url: object.url,
            });
          };
    });
    res.status(200).json(info);
  })
  .catch((err) => {
    console.log('ERROR:', err);
    res.sendStatus(400);
  })
});

//POST QUESTION
app.post(`/qa/questions/`, async (req, res) => {
  await db.query(`INSERT INTO questions (product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness) VALUES (${req.body.product_id}, '${req.body.body}', 1616066721011, '${req.body.name}', '${req.body.email}', 0, 0);`)
    .then((result) => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log('error:', err);
      res.sendStatus(400);
    })
});

//POST ANSWER
app.post(`/qa/questions/:question_id/answers`, async (req, res) => {
  if (!req.body.photos) {
    await db.query(`INSERT INTO answers (question, body, date, answerer_name, answerer_email, reported, helpfulness) VALUES (${req.params.question_id}, '${req.body.body}', 1616066721011, '${req.body.name}', '${req.body.email}', 0, 0);`)
    .then((result) => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log('error:', err);
      res.sendStatus(400);
    })
  }
  if (req.body.photos) {
    await db.query(`INSERT INTO answers (question, body, date, answerer_name, answerer_email, reported, helpfulness) VALUES (${req.params.question_id}, '${req.body.body}', 1616066721011, '${req.body.name}', '${req.body.email}', 0, 0) RETURNING answer_id;`)
    .then( async (result) => {
      let temp = '';
      req.body.photos.forEach((url, index) => {
        if (index !== req.body.photos.length - 1) {
          temp = temp + `'${url}'` + ', ';
        } else {
          temp = temp + `'${url}'`;
        }
      })
      console.log(temp);
      await db.query(`INSERT INTO photos (answer_id, url) SELECT ${result.rows[0].answer_id} id, x FROM UNNEST(ARRAY[${temp}]) x;`)
    })
    .then((result) => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log('error:', err);
      res.sendStatus(400);
    })
  }
});