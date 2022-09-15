const client = require('./db/index.js');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
let app = express();
module.exports.app = app;

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})