const UserModal = require('../model/user');
const JobModal = require('../model/job');

const { getJWTPayload } = require('../utils/index');


class UserController {
  constructor() { }

  getUserInfo = async ctx => {
    const authorization = ctx.request.header.authorization;
    if (authorization) {

      const { openid } = getJWTPayload(authorization);
      await UserModal.findOne({
        openid
      }).exec().then(userInfo => {
        if(userInfo) {
          ctx.body = {
            code: 200,
            message: '获取用户的基本信息成功',
            data: {
              userInfo
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
              isConfirm: !!userInfo.company,
              company: userInfo.company
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
    
    const { username, wx, scholl, grade, gender, company, job_type, job_img, job_time } = ctx.request.body;
    const params = {
      username,
      wx,
      gender,
      company,
      job_type,
      job_img,
      scholl,
      grade,
      job_time,
    };
    let _params = {}
    for(let i in params) {
      !!params[i] && (_params[i] = params[i])
    }
    console.log('[params] ---', _params);

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
        ..._params
      }).exec().then(async result => {
        console.log('result ---', result);

        ctx.body = {
          code: 200,
          message: '信息更新成功',
          data: {
            ...params
          }
        }
      });
    }
  }

  getUserPublish = async ctx => {
    const authorization = ctx.request.header.authorization;
    if (authorization) {
      const { openid } = getJWTPayload(authorization);
      if (!openid) ctx.body = {
        code: 4001,
        message: '用户未登录，请前往登录',
        data: {}
      }

      await JobModal.find({
        uid: openid
      }, {
        job_name: 1,
        job_type: 1,
        job_origin: 1,
        job_city: 1,
        job_company: 1,
        _id: 1,
      }).exec().then(job_doc => {
        // if()
        console.log('job_doc ---查询我发送的职位信息', job_doc)
        let docList = [...job_doc].map(company =>
          Object.assign({}, { ...company.toObject() }, { job_id: company._id })
        ) || [];
        ctx.body = {
          code: 200,
          message: '获取信息成功',
          data: {
            list: docList
          }
        }
      })
    }
  }
}

module.exports = new UserController();