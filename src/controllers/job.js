const JobModal = require('../model/job');
const UserModal = require('../model/user');
const jwt = require('jsonwebtoken');
const { mdSecret } = require('../config/app');
const { matchCompany } = require('../utils/index');

/* 通过token获取JWT的payload部分 */
function getJWTPayload(token) {
  // 验证并解析JWT
  return jwt.verify(token.split(' ')[1], mdSecret);
}

class Job {
  constructor() { }

  publishJob = async ctx => {
    // job_type: 'product' | 'business',
    // job_city: 'beijing',
    // job_name: '产品经理实习生',
    // job_email: 'test@163.com',
    // job_origin: 'hr' | 'sp' | 'temp',
    // job_desc: '工作概述，这里需要加上文本格式',
    // job_isOffical: true, // 是否可转正
    const { job_type, job_city, job_name, job_email, job_origin, job_desc, job_isOffical, job_company } = ctx.request.body;
    // 验证token，查询到用户openId，插入该文章
    const authorization = ctx.request.header.authorization;
    console.log('token -- ', authorization);
    if (authorization) {

      let payload = getJWTPayload(ctx.headers.authorization);
      console.log(payload, 'payload');

      const { openid } = payload;
      await UserModal.findOne({
        openid
      }).exec().then(async result => {
        console.log(result, 'result');
        if (!result) {
          console.log('没有该用户，请登录才能发布数据')
        } else {
          // TODO: 根据job_company公司名称去查询公司名称及相关logo
          // 如果是未知，既给一个默认未知logo；

          let companyDetail = matchCompany(job_company);

          const params = {
            job_type,
            job_city,
            job_name,
            job_email,
            job_origin,
            job_desc,
            job_isOffical,
            uid: openid,
            job_company: companyDetail,
          };
          console.log('params --- ', params);
          // 岗位详情数据入库
          const NewJobInfoModal = new JobModal(params);
          try {
            const _save = await NewJobInfoModal.save()
            console.log('[mongoSave]', _save)
            //成功返回code=200，并返回成sessionKey
            ctx.body = {
              code: 200,
              msg: '文章发布成功',
              data: {
                params
              }
            }
          } catch (err) {
            console.log('[mongoSaveError]', err);
            ctx.body = {
              code: 500,
              msg: '文章发布失败',
              data: {}
            }
          }
        }
      });
    } else {
      console.log(111)
      ctx.body = {
        code: 401,
        msg: '未授权'
      }
    }
  }

  getJobList = async ctx => {
    const { job_type = 'all', nextPageNum = 1 } = ctx.query;
    let allListData = [];
    // TODO: 这里获取所有的职位信息数据进行查询
    let queryTypes = job_type === 'all' ? {} : { job_type: job_type };

    await JobModal.countDocuments({...queryTypes}).exec().then(async count => {
      await JobModal.find({
        ...queryTypes
      }, {
        job_name: 1,
        job_type: 1,
        job_origin: 1,
        job_city: 1,
        job_company: 1,
        _id: 1,
      }, {
        skip: (nextPageNum - 1) * 2, // 相当于页数
        limit: 2, // 相当于每页个数
      }, (err, doc) => {
        if (!err) {
          allListData = [...doc].map(company =>
            Object.assign({}, { ...company.toObject() }, { job_id: company._id })
          );
          ctx.body = {
            code: 200,
            msg: '获取职位信息成功',
            data: {
              list: allListData,
              total: count,
              currentNum: nextPageNum
            }
          }
        }
      });
    })
  }

  getjobDetail = async ctx => {
    const { job_id } = ctx.query;
    await JobModal.findOne({
      _id: job_id
    }).exec().then(res => {
      const {
        job_type,
        job_city,
        job_email,
        job_origin,
        job_desc,
        job_isOffical,
        job_company,
        job_name
      } = res;
      ctx.body = {
        code: 200,
        msg: '获取职位详情信息成功',
        data: {
          job_id,
          job_type,
          job_city: [...job_city],
          job_email,
          job_origin,
          job_desc,
          job_isOffical,
          job_company,
          job_name
        }
      }
    });
  }

}

module.exports = new Job();