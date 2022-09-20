const db = require('../db/index.js');

module.exports = {
  get: async function (req, res) {
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
  },

  post: async function (req, res) {
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
  }
}