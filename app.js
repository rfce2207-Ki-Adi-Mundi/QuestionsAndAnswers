const db = require('./db/index.js');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
let app = express();
const router = require('./routes.js');

module.exports.app = app;

const port = process.env.SERVERPORT || 8080;

//MIDDLEWARE
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`)
});

server.keepAliveTimeout = 49 * 1000;

app.use('/qa', router);


//LOADER.IO AUTHENTICATION
app.get('/loaderio-4085198a399b511073837fffdf095583.txt', (req, res) => {
  res.download('./loaderio-4085198a399b511073837fffdf095583.txt');
});
