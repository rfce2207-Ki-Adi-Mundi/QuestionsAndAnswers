var controller = require('./controllers');
var router = require('express').Router();

router.get('/questions', controller.questions.get);
