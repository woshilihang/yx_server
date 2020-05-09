const CollectModal = require('../model/collect');
const RentModal = require('../model/rent');
const UserModal = require('../model/user');

const { getJWTPayload } = require('../utils/index');

class CollectController {
  constructor() { }


  setCollect = async ctx => {
    const { content_id, collect_origin } = ctx.request.body

    const authorization = ctx.request.header.authorization;
    if (authorization) {
      const { openid } = getJWTPayload(authorization);
      if (!openid) ctx.body = {
        code: 4001,
        message: '用户未登录，请前往登录',
        data: {}
      }

      await CollectModal.findOne({
        content_id,
        collect_origin
      }).exec().then(async collect => {
        if (!collect) {
          const saveParams = {
            uid: openid,
            content_id,
            collect_origin
          }
          console.log('params --- ', saveParams);
          const NewCollectModal = new CollectModal(saveParams);
          try {
            const _save = await NewCollectModal.save();
            console.log('[mongoSave]', _save)
            ctx.body = {
              code: 200,
              message: '收藏成功',
              data: {
                copy_id: _save._id,
                collect_origin,
                isCollected: true
              }
            }
          } catch (err) {
            console.log('[mongoSaveError]', err);
            ctx.body = {
              code: 500,
              message: '收藏失败',
              data: {}
            }
          }
        } else {
          // 该条信息存在复制记录则更新复制内容
          await CollectModal.deleteOne({
            content_id,
            collect_origin
          }).exec().then(res => {
            console.log('删除数据 --结果', res)
            ctx.body = {
              code: 200,
              message: '删除成功',
              data: {
                isCollected: false
              }
            }
          })
        }
      })
    }
  }

  getCollect = async ctx => {
    const { content_id, collect_origin } = ctx.request.body

    const authorization = ctx.request.header.authorization;
    if (authorization) {
      const { openid } = getJWTPayload(authorization);
      if (!openid) ctx.body = {
        code: 4001,
        message: '用户未登录，请前往登录',
        data: {}
      }

      await CollectModal.findOne({
        content_id,
        collect_origin
      }).exec().then(async collect => {
        console.log('collect 查询结果 ===', collect)
        ctx.body = {
          code: 200,
          data: {
            isCollected: !!collect
          }
        }
      })
    }
  }

  getCollectList = async ctx => {
    const authorization = ctx.request.header.authorization;
    if (authorization) {
      const { openid } = getJWTPayload(authorization);
      if (!openid) ctx.body = {
        code: 4001,
        message: '用户未登录，请前往登录',
        data: {}
      }

      await CollectModal.find({
        uid: openid
      }).exec().then(async collect_doc => {
        // 根据获取到用户收藏的数据，找到对应的来源以及id去查找相关的数据

        let waitReqChildArr = [];
        collect_doc.forEach(collect => {
          waitReqChildArr.push(new Promise(async (resolve, reject) => {
            let collect_item = { ...collect.toObject() }
            let { content_id, collect_origin } = collect_item
            let modalKeyMap = {
              'rent': RentModal
            }
            await modalKeyMap[collect_origin].findById({
              _id: content_id
            }, {
              rent_desc: 1,
              _id: 1,
              rent_imgList: 1,
              rent_origin: 1,
              uid: 1
            }).exec().then(async rent => {
              console.log('=== 查询到的租房信息为 ===', rent, rent.uid)
              await UserModal.findOne({
                openid: rent.uid
              }, {
                nickName: 1,
                avatar: 1,
                company: 1,
                job_type: 1
              }).exec().then(userInfo => {
                resolve({
                  ...rent.toObject(),
                  userInfo
                })
              })
            })
          }))
        });

        await Promise.all(waitReqChildArr).then(res => {
          console.log('获取collect请求内容 ----', res)
          ctx.body = {
            code: 200,
            message: '获取收藏内容成功',
            data: {
              list: res
            }
          }
        })
      })
    }
  }
}

module.exports = new CollectController();