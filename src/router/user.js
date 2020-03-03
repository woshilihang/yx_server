const Router = require('@koa/router');

const LoginController = require('../controllers/login');

const router = new Router();

router.get('/user/login', LoginController.loginAction);

router.post('/user/test', LoginController.testAction);

module.exports = router;