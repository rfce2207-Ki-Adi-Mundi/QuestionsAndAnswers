const {Client, Pool} = require('pg');
require('dotenv').config();


const client = new Pool({
  host: process.env.HOST,
  user: process.env.NAME,
  port: process.env.PORT,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

//CONNECT TO DATABASE
client.connect((err) => {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected to ' + client.database + ' as id ' + client.user + ' at port ' + client.port);
});

//INVOKE ETL PROCESS IF EMPTY DATABASE
// client.query(`SELECT count(*) from questions`)
//   .then((result) => {
//     console.log('success:', result.rows[0].count);
//   })
//   .catch((err) => {
//     invokeETL();
// });


//ETL PROCESS
const invokeETL = () => {
  client.query(`CREATE TABLE IF NOT EXISTS questions ( question_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL, product_id int NOT NULL, question_body text NOT NULL, question_date bigint NOT NULL, asker_name varchar(40) NOT NULL, asker_email text NOT NULL, reported smallint NOT NULL, question_helpfulness smallint NOT NULL);`)
  .then( async (confirm) => {
    console.log('questions table ready');
    await client.query(`CREATE TABLE IF NOT EXISTS answers ( answer_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL, question int not null, body text not null, date bigint not null, answerer_name varchar(40) not null, answerer_email text not null, reported smallint, helpfulness smallint, CONSTRAINT fk_questions FOREIGN KEY(question) REFERENCES questions(question_id));`)
  })
  .then(async (confirm) => {
    console.log('answers table ready!');
    await client.query(`CREATE TABLE IF NOT EXISTS photos ( photo_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY, answer_id int NOT NULL, url text NOT NULL, CONSTRAINT photos_fk FOREIGN KEY(photo_id) references answers(answer_id));`)
  })
  .then(async (confirm) => {
    console.log('photos table ready!');
    await client.query(`COPY questions FROM '/Users/sunjuhwang/Hack Reactor/SDC/QuestionsAndAnswers/csvFiles/questionsData.csv' DELIMITER ',' CSV HEADER;`)
  })
  .then(async (confirm) => {
    console.log('copied questions csv!');
    await client.query(`COPY answers FROM '/Users/sunjuhwang/Hack Reactor/SDC/QuestionsAndAnswers/csvFiles/answersData.csv' DELIMITER ',' CSV HEADER;`)
  })
  .then(async (confirm) => {
    console.log('copied answer csv! ');
    await client.query(`COPY photos FROM '/Users/sunjuhwang/Hack Reactor/SDC/QuestionsAndAnswers/csvFiles/answers_photosData.csv' DELIMITER ',' CSV HEADER;`)
  })
  .then(async (confirm) => {
    console.log('copied photos csv! ');
    await client.query(`CREATE INDEX questions_product_id_idx ON questions (product_id);`)
  })
  .then(async (confirm) => {
    console.log('Indexed product_id in questions table');
    await client.query(`CREATE INDEX answers_question_idx ON answers (question);`)
  })
  .then(async (confirm) => {
    console.log('Indexed question in answers table');
    await client.query(`CREATE INDEX photos_answer_id_idx ON photos (answer_id);`)
  })
  .then(async (confirm) => {
    console.log('Indexed answer_id in photos table');
    await client.query(`SELECT setval('questions_question_id_seq', (SELECT max(question_id) FROM questions));`)
  })
  .then(async (confirm) => {
    console.log('set max value in questions table');
    await client.query(`SELECT setval('answers_answer_id_seq', (SELECT max(answer_id) FROM answers));`)
  })
  .then(async (confirm) => {
    console.log('set max value in answers table');
    await client.query(`SELECT setval('photos_photo_id_seq', (SELECT max(photo_id) FROM photos));`)
  }).then(async (confirm) => {
    await console.log('set max value in photos table');
  })
  .catch((err) => {
    console.log('error creating tables:', err)
  });
}

  module.exports = client;