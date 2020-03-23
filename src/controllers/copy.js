const CopyModal = require('../model/copy');
const JobModal = require('../model/job');

const { getJWTPayload } = require('../utils/index');

class CopyController {
  constructor() { }

  setCopy = async ctx => {
    const { content_id, copy_val } = ctx.request.body

    const authorization = ctx.request.header.authorization;
    if (authorization) {
      const { openid } = getJWTPayload(authorization);
      if (!openid) ctx.body = {
        code: 4001,
        message: '用户未登录，请前往登录',
        data: {}
      }

      // TODO: 优化点，先查询是否存在该id，有的话内容还不一致就更新
      await CopyModal.findOne({
        content_id
      }).exec().then(async copy => {
        if (!copy) {
          const saveParams = {
            uid: openid,
            content_id,
            copy_val
          }
          console.log('params --- ', saveParams);
          const NewCopyModal = new CopyModal(saveParams);
          try {
            const _save = await NewCopyModal.save();
            console.log('[mongoSave]', _save)
            ctx.body = {
              code: 200,
              message: '复制成功',
              data: {
                copy_id: _save._id,
                copy_val
              }
            }
          } catch (err) {
            console.log('[mongoSaveError]', err);
            ctx.body = {
              code: 500,
              message: '复制失败',
              data: {}
            }
          }
        } else {
          // 该条信息存在复制记录则更新复制内容
          await CopyModal.updateOne({
            content_id
          }, {
            copy_val
          }).exec().then(updateCopy => {
            console.log('更新复制请求 --结果', updateCopy)
            ctx.body = {
              code: 200,
              message: '复制更新成功',
              data: {
                copy_id: copy._id,
                copy_val
              }
            }
          })
        }
      })

    }
  }

  getCopy = async ctx => {
    const authorization = ctx.request.header.authorization;
    if (authorization) {
      const { openid } = getJWTPayload(authorization);
      if (!openid) ctx.body = {
        code: 4001,
        message: '用户未登录，请前往登录',
        data: {}
      }

      await CopyModal.find({
        uid: openid
      }).exec().then(async copy_doc => {
        // const copy_doc_list = 
        let waitReqChildArr = [];
        copy_doc.forEach(copy => {
          waitReqChildArr.push(new Promise(async (resolve, reject) => {
            let copy_item = { ...copy.toObject() }
            let { content_id } = copy_item
            await JobModal.findById({
              _id: content_id
            }, {
              job_name: 1,
              job_type: 1,
              job_origin: 1,
              job_city: 1,
              job_company: 1,
              _id: 1,
            }).exec().then(job => {
              resolve({
                ...job.toObject(),
                copy_val: copy.copy_val
              })
            })
          }))
        });

        await Promise.all(waitReqChildArr).then(res => {
          console.log('获取copy请求内容 ----', res)
          ctx.body = {
            code: 200,
            message: '获取已复制内容成功',
            data: {
              list: res
            }
          }
        })
      })
    }
  }
}

module.exports = new CopyController();