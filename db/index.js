//  \COPY questions FROM '/Users/sunjuhwang/Hack Reactor/SDC/QuestionsAndAnswers/csvFiles/questionsData.csv' DELIMITER ',' CSV HEADER;
//  \COPY answers FROM '/Users/sunjuhwang/Hack Reactor/SDC/QuestionsAndAnswers/csvFiles/answersData.csv' DELIMITER ',' CSV HEADER;
//  \COPY photos FROM '/Users/sunjuhwang/Hack Reactor/SDC/QuestionsAndAnswers/csvFiles/answers_photosData.csv' DELIMITER ',' CSV HEADER;

const {Client} = require('pg');

const client = new Client({
  host: 'localhost',
  user: 'sunjuhwang',
  port: 5432,
  password: '',
  database: 'questionsandanswers'
});

client.connect((err) => {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected to ' + client.database + ' as id ' + client.user);
  });


client.query(`CREATE TABLE IF NOT EXISTS questions ( question_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL, product_id int NOT NULL, question_body text NOT NULL, question_date bigint NOT NULL, asker_name varchar(40) NOT NULL, asker_email text NOT NULL, reported smallint NOT NULL, question_helpfulness smallint NOT NULL);`)
  .then((confirm) => {
    console.log('questions table ready!');
    client.query(`CREATE TABLE IF NOT EXISTS answers ( answer_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY NOT NULL, question int not null, body text not null, date bigint not null, answerer_name varchar(40) not null, answerer_email text not null, reported smallint, helpfulness smallint, CONSTRAINT fk_questions FOREIGN KEY(question_id) REFERENCES questions(question_id));`)
  })
  .then((confirm) => {
    console.log('answers table ready!');
    client.query(`CREATE TABLE IF NOT EXISTS photos ( photo_id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY, answer_id int NOT NULL, url text NOT NULL, CONSTRAINT photos_fk FOREIGN KEY(photo_id) references answers(answer_id));`)
  })
  .then((confirm) => {
    console.log('photos table ready!');
  })
  .catch((err) => {
    console.log('error creating tables:', err)
  });

//CREATE INDEX photos_answer_id_idx ON photos (answer_id);
//CREATE INDEX answers_question_idx ON answers (question);
//CREATE INDEX questions_product_id_idx ON questions (product_id);

//SELECT setval('answers_answer_id_seq', (SELECT max(answer_id) FROM answers));
//SELECT setval('questions_question_id_seq', (SELECT max(question_id) FROM questions));

module.exports = client;