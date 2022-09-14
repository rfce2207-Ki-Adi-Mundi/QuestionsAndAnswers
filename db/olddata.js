const {Client} = require('pg');

const client = new Client({
  host: 'localhost',
  user: 'sunjuhwang',
  port: 5432,
  password: '',
  database: 'olddata'
});

client.connect((err) => {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + client.user);
  });

client.query(`Select * from test`, (err, res) => {
  if (!err) {
    console.log(res.rows);
  } else {
    console.log(err.message);
  }
  client.end;
});