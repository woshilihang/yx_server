const UserModal = require('../model/user');
const { getJWTPayload } = require('../utils/index');


class UserController {
  constructor() { }


  getUserMsg = async ctx => {
    const authorization = ctx.request.header.authorization;
    if (authorization) {

      const { openid } = getJWTPayload(authorization);
      await UserModal.findOne({
        openid
      }).exec().then(userInfo => {

        if (userInfo) {
          ctx.body = {
            code: 200,
            message: '用户已经认证',
            data: {
              isConfirm: !!userInfo.company
            }
          };
        } else {
          ctx.body = {
            code: 500,
            message: '用户不存在，token无效',
            data: {}
          };
        }
      });
    }

  }

  updateMsg = async ctx => {
    const { userName, wx, gender, company, job_type, job_img } = ctx.request.body;
    const params = {
      userName,
      wx,
      gender,
      company,
      job_type,
      job_img
    };
    console.log('[params] ---', params);

    const authorization = ctx.request.header.authorization;
    if (authorization) {
      const { openid } = getJWTPayload(authorization);
      if (!openid) ctx.body = {
        code: 4001,
        message: '用户未登录，请前往登录',
        data: {}
      }

      await UserModal.findOneAndUpdate({
        openid
      }, {
        userName,
        wx,
        gender,
        company,
        job_type,
        job_img
      }).exec().then(async result => {
        console.log('result ---', result);

        ctx.body = {
          code: 200,
          message: '信息更新成功',
          data: {
            params
          }
        }
      });
    }
  }
}

module.exports = new UserController();