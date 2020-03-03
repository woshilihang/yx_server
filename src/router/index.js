const CommonRouter = require('./common');
const LoginRouter = require('./login');
const UploadRouter = require('./upload');
const UserRouter = require('./user');

const RouterList = [
  CommonRouter,
  LoginRouter,
  UploadRouter,
  UserRouter,
];

const Routes = (app) => {
  for(let router of RouterList) {
    // app.use(router.routes(), router.allowedMethods());
    app.use(router.routes()).use(router.allowedMethods())
  }
};

module.exports = Routes;