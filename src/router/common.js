const PassThrough = require('stream').PassThrough;
const Router = require('@koa/router');

const JobController = require('../controllers/job');
const PinsController = require('../controllers/pins');
const ReplyController = require('../controllers/reply');
const UserController = require('../controllers/user');
const CopyController = require('../controllers/copy');
const RentController = require('../controllers/rent');
const CollectController = require('../controllers/collect');

const { getWxCodeUnlimit } = require('../utils/getWxCode');


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

router.get('/user/info', UserController.getUserInfo);

router.get('/user/publish', UserController.getUserPublish);

// copy
router.post('/user/publishCopy', CopyController.setCopy);

router.get('/user/getCopyList', CopyController.getCopy);

// rent
router.post('/rent/publish', RentController.publishPins);

router.get('/rent/list', RentController.getRentList);

router.get('/rent/detail', RentController.getRentDetail);


// 收藏相关
router.post('/collect/set', CollectController.setCollect);

router.post('/collect/get', CollectController.getCollect);

router.get('/collect/list', CollectController.getCollectList);




// 生成小程序码
router.get('/wx/common/qrcode', async ctx => {
  const stream = await getWxCodeUnlimit({
    page: 'pages/job_detail/index',
    scene: 'abc123'
  });
  ctx.body = stream.pipe(PassThrough())
});

module.exports = router;