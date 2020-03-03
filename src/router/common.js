const Router = require('@koa/router');

const JobController = require('../controllers/job');

const router = new Router();

router.get('/', (ctx) => {
  ctx.body = `hello koa with yx_server`;
});

router.get('/job/list', JobController.getJobList);

router.post('/job/publish', JobController.publishJob);

router.get('/job/detail', JobController.getjobDetail);


module.exports = router;