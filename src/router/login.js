const Router = require('@koa/router');

const mysql = require('../mysql/index');

const router = new Router();

router.post('/login',  async ctx => {
  console.log(ctx.request.body);
  ctx.body = `logining ${JSON.stringify(ctx.request.body)}`;
});


router.get('/users',async (ctx) => {
    let data = await mysql.query();
    console.log(data, 'data');
    ctx.body = {
      code: 200,
      data,
      msg: 'success'
    }
  }
);

module.exports = router;