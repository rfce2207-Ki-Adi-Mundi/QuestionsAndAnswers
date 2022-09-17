//I USED \COPY IN THE PSQL COMMAND-LINE TO IMPORT THE VARIOUS CSV FILES

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


client.query(`CREATE TABLE IF NOT EXISTS questions ( question_id int PRIMARY KEY NOT NULL, product_id int NOT NULL, question_body text NOT NULL, question_date bigint NOT NULL, asker_name varchar(40) NOT NULL, asker_email text NOT NULL, reported smallint NOT NULL, question_helpfulness smallint NOT NULL);`, (err, res) => {
  if (err) {
    console.log('error creating questions table', err);
    return;
  }
  console.log('questions table created!');
  client.query(`CREATE TABLE IF NOT EXISTS answers ( answer_id int PRIMARY KEY NOT NULL, question int not null, body text not null, date bigint not null, answerer_name varchar(40) not null, answerer_email text not null, reported smallint, helpfulness smallint, CONSTRAINT fk_questions FOREIGN KEY(question_id) REFERENCES questions(question_id));`, (err, res) => {
    if (err) {
      console.log('error creating answers table');
      return;
    }
    console.log('answers table created!');
    client.query(`CREATE TABLE IF NOT EXISTS photos ( photo_id int PRIMARY KEY, answer_id int NOT NULL, url text NOT NULL, CONSTRAINT photos_fk FOREIGN KEY(photo_id) references answers(answer_id));`, (err, res) => {
      if (err) {
        console.log('error creating photos table');
        return;
      }
      console.log('photos table created!');
      // client.query('SELECT ')
    });
  });
});

      // db.query(`select json_agg(photos.url) from photos inner join answers on answers.answer_id = photos.answer_id where answers.answer_id = ${object.answer_id};`, (err, result2) => {

module.exports = client;