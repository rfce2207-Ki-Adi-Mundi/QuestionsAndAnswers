var controller = require('./controllers');
var router = require('express').Router();

router.get('/questions', controller.questions.get);
router.post('/questions', controller.questions.post);
router.get('/questions/:question_id/answers', controller.answers.get);
router.post('/questions/:question_id/answers', controller.answers.post);


module.exports = router;
