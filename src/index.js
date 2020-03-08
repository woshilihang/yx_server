const path = require('path');
const fs = require('fs');

const Koa = require('koa');
const server = require('koa-static');
const logger = require('koa-logger');
const onerror = require('koa-error');
const KoaBody = require('koa-bodyparser');
const KoaJwt = require('koa-jwt');

const Router = require('./router/index');

const app = new Koa();

const ErrorHandle = require('./middlewares/errorHandle');
const config = require('./config/default');
const startMongo = require('./utils/mongo');
const models = path.join(__dirname, './model');
const { mdSecret } = require('./config/app');

// 开始MongoDB数据库连接
startMongo();

// middlewares
app.use(KoaBody({
  enableTypes: ['json', 'form', 'text']
}));
app.use(logger());
app.use(server(path.resolve(`${__dirname}`, './static')));

// error handler
onerror(app);
// 处理未带token错误验证的情况
app.use(ErrorHandle).use(KoaJwt(
  { secret: mdSecret }
).unless({
  // /\/job\/publish/
  path: [
    /\/user\/login/,
    /\/job\/publish/,
    /\job\/list/,
    /\/job\/detail/,
    /\/pins\/upload/,
    /\/pins\/list/,

  ],
}));




// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url}  - ${ms}ms`);
});

// 处理跨域请求
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , ');

  if (ctx.methods == 'OPTIONS') {
    ctx.status = 200;
  } else {
    await next();
  }

});


// 遍历引入mongo ~0 => -1 ~-1 => 0
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^.].*\.js$/))
  .forEach(file => require(path.join(models, file)));

Router(app);

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

app.listen(config.port, () => {
  console.log(`1staring at port ${config.port}...`);
});