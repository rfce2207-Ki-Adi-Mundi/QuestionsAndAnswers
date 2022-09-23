const db = require('../db/index.js');

module.exports = {
  get: async function (req, res) {
    let product = parseInt(req.query.product_id);
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.count) || 10;
    let answer_ids = [];
    let final = [];
    let info = {
      product_id: product,
      results: []
    };
    if (limit > 50) {
      limit = 50;
    };
    await db.query(`SELECT json_build_object(
      'question_id', questions.question_id,
      'question_body', questions.question_body,
      'question_date', questions.question_date,
      'asker_name', questions.asker_name,
      'question_helpfulness', questions.question_helpfulness,
      'reported', questions.reported,
      'answers', (SELECT json_agg(json_build_object(
        'id', answers.answer_id,
        'body', answers.body,
        'date', answers.date,
        'answerer_name', answers.answerer_name,
        'helpfulness', answers.helpfulness,
        'photos', (SELECT json_agg(json_build_object(
          'id', photos.photo_id,
          'url', photos.url))
          FROM photos WHERE photos.answer_id = answers.answer_id)))
          FROM answers WHERE answers.question = questions.question_id))
          FROM questions WHERE product_id = ${product} AND questions.reported = 0 ORDER BY questions.question_helpfulness DESC limit ${limit};`)
      .then( async (result) => {
        if (result.rows.length === 0) {
          res.status(200).json(info);
          return;
        } else {
          let questions = result.rows;
          questions.forEach((question) => {
            question.json_build_object.question_date = new Date(Number(question.json_build_object.question_date)).toISOString();
            question.json_build_object.reported = !!question.json_build_object.reported;
            let answerObj = {};
            if (question.json_build_object.answers === null) {
              question.json_build_object.answers = {};
            } else {
              question?.json_build_object?.answers?.forEach((answer) => {
                answer.date = new Date(Number(answer.date)).toISOString();
                if (answer.photos === null) {
                  answer.photos = [];
                } else {
                  let temp = [];
                  answer.photos.forEach((obj) => {
                    temp.push(obj.url);
                  })
                  answer.photos = temp;
                }
                answerObj[answer.id] = answer;
              })
              question.json_build_object.answers = answerObj;
            }
            info.results.push(question.json_build_object)
          })
        res.status(200).json(info);
        return;
        }
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(400);
      })
    },
    post: async function (req, res) {
      await db.query(`INSERT INTO questions (product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness) VALUES (${req.body.product_id}, '${req.body.body}', 1616066721011, '${req.body.name}', '${req.body.email}', 0, 0);`)
      .then((result) => {
        res.sendStatus(201);
      })
      .catch((err) => {
        console.log('error:', err);
        res.sendStatus(400);
      })
    }
  }