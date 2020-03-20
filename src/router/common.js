const Router = require('@koa/router');

const JobController = require('../controllers/job');
const PinsController = require('../controllers/pins');
const ReplyController = require('../controllers/reply');
const UserController = require('../controllers/user');


const router = new Router();

router.get('/', (ctx) => {
  ctx.body = `hello koa with yx_server`;
});

router.get('/job/list', JobController.getJobList);

router.post('/job/publish', JobController.publishJob);

router.get('/job/detail', JobController.getjobDetail);

router.post('/pins/publish', PinsController.publishPins);

router.get('/pins/list', PinsController.getPinsList);

router.get('/pins/detail', PinsController.getPinsDetail);

router.post('/pins/prize', PinsController.postPinsPrize);

router.post('/reply/publish', ReplyController.publishReply);

router.post('/user/update', UserController.updateMsg);

router.get('/user/msg', UserController.getUserMsg);




module.exports = router;