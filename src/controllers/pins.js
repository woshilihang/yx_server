const PinsModal = require('../model/pins');
const UserModal = require('../model/user');
const ReplyModal = require('../model/reply');


const { getJWTPayload } = require('../utils/index');

class PinsController {
  constructor() { }

  publishPins = async ctx => {
    const { pins_desc, pins_imgList } = ctx.request.body;

    // TODO: 解析token获取到openid查看到对应的uid,插入一条沸点

    const authorization = ctx.request.header.authorization;

    if (authorization) {
      let payload = getJWTPayload(ctx.request.header.authorization);

      const { openid } = payload;

      // 查询是否有该用户，正常逻辑不会存在没有的情况
      await UserModal.findOne({
        openid
      }).exec().then(async result => {
        if (!result) {
          console.log('没有该用户，请登录才能发布数据')
        } else {
          // 存储改沸点信息
          const saveParams = {
            uid: openid,
            pins_desc,
            pins_imgList,
          };
          console.log('params --- ', saveParams);
          const NewPinsInfoModal = new PinsModal(saveParams);
          try {
            const _save = await NewPinsInfoModal.save();
            console.log('[mongoSave]', _save)
            //成功返回code=200，并返回成sessionKey
            ctx.body = {
              code: 200,
              message: '文章发布成功',
              data: {
                pins_id: _save._id,
                uid: openid
              }
            }
          } catch (err) {
            console.log('[mongoSaveError]', err);
            ctx.body = {
              code: 500,
              message: '沸点发布失败',
              data: {}
            }
          }
        }
      })

    }
  }

  handleGetData = async (doc, openid, isMongoObj = true) => {
    return new Promise(async (resolve, reject) => {
      await UserModal.findOne({
        openid
      }).exec().then(userInfo => {
        if (userInfo) {
          const { nickName, avatar = '', company = '', job_type = '' } = userInfo;
          // 如果是Mongoose查出来的对象则需要处理成object，
          const restObj = isMongoObj ? { ...doc.toObject() } : doc;
          let tempData = Object.assign({}, restObj, { [`${doc}_id`]: doc._id },
            {
              userInfo: {
                nickName,
                avatar,
                company,
                job_type
              }
            }
          );
          resolve(tempData);
        } else {
          reject(false)
        }
      });
    });
  }

  /**
   * 获取沸点详情
   *
   * @memberof PinsController
   */
  getPinsDetail = async ctx => {
    const { pins_id } = ctx.request.query;
    if (!pins_id) ctx.body = {
      code: 400,
      message: '参数格式错误',
      data: {}
    };

    await PinsModal.findOne({
      _id: pins_id
    }, {
      pins_desc: 1,
      _id: 1,
      pins_imgList: 1,
      pins_prize: 1,
      pins_comment: 1,
      uid: 1
    }).exec().then(async pinsRes => {
      console.log(pinsRes.uid);
      if (pinsRes && pinsRes.uid) {

        await UserModal.findOne({
          openid: pinsRes.uid
        }).exec().then(async userInfo => {
          if (userInfo) {
            console.log(userInfo, 'userInfo')
            const { nickName, avatar = '', company = '', job_type = '' } = userInfo;
            let tempData = Object.assign({}, { ...pinsRes.toObject() }, { pins_id: pinsRes._id },
              {
                userInfo: {
                  nickName,
                  avatar,
                  company,
                  job_type
                }
              }
            );

            // 获取到的评论信息
            let replyList = [];
            await ReplyModal.find({
              reply_to_id: pins_id
            }, {
              reply_content: 1,
              reply_uid: 1,
              _id: 1,
              reply_to_id: 1,
              reply_childs: 1,
            }).exec().then(async doc => {
              console.log('查询到该文章所有的一级文章评论数据为 ----', doc);
              let waitReqArr = [];

              [...doc].forEach(async reply => {
                // console.log('doc.reply_childs', reply.reply_childs);
                // console.log(!!reply.reply_childs);
                let waitReqChildArr = [];
                if (reply.reply_childs) {
                  console.log('一级文章数据具有子评论, ---', doc.reply_childs);
                  [...reply.reply_childs].forEach(reply_child => {
                    console.log('reply_uid', reply_child.reply_uid)
                    reply_child.reply_uid && waitReqChildArr.push(this.handleGetData(reply_child, reply_child.reply_uid, false));
                  });
                  Promise.all(waitReqChildArr).then(resChild => {
                    console.log(resChild, 'resChild');
                    reply.reply_childs = resChild;
                  })
                }
                waitReqArr.push(this.handleGetData(reply, reply.reply_uid, true));
              });


              await Promise.all(waitReqArr).then(res => {
                replyList = res;
              }).catch(err => {
                console.log('err ---', err);
                ctx.body = {
                  code: 500,
                  message: '获取沸点信息失败',
                  data: {}
                }
              });
            });

            ctx.body = {
              code: 200,
              message: '获取职位信息成功',
              data: {
                ...tempData,
                replyList: replyList
              }
            }
          }
        });
      }
    });
  }

  /**
   * 获取沸点列表
   *
   * @memberof PinsController
   */
  getPinsList = async ctx => {
    const { job_type = 'all', nextPageNum = 1 } = ctx.query;
    let queryTypes = job_type === 'all' ? {} : { job_type: job_type };

    await PinsModal.countDocuments({ ...queryTypes }).exec().then(async count => {
      await PinsModal.find({
        ...queryTypes
      }, {
        pins_desc: 1,
        _id: 1,
        pins_imgList: 1,
        pins_prize: 1,
        pins_comment: 1,
        uid: 1
      }, {
        skip: (nextPageNum - 1) * 2, // 相当于页数
        limit: 5, // 相当于每页个数
        sort: {
          createAt: -1
        }
      }
      ).exec().then(async doc => {
        let waitReqArr = [];

        [...doc].forEach(pins => {
          waitReqArr.push(this.handleGetData(pins, pins.uid, true));
        });

        await Promise.all(waitReqArr).then(res => {
          console.log('返回的数组集合', res);
          ctx.body = {
            code: 200,
            message: '获取职位信息成功',
            data: {
              list: res,
              total: count,
              currentNum: nextPageNum
            }
          }
        }).catch(err => {
          console.log('err ---', err);
          ctx.body = {
            code: 500,
            message: '获取沸点信息失败',
            data: {}
          }
        });

      });
    })
  }

  /**
   * 点赞
   *
   * @memberof PinsController
   */
  postPinsPrize = async ctx => {
    const { pins_id } = ctx.request.body;
    let uid = ''
    await this.findUserById(ctx).then(openid => uid = openid)
    console.log(uid, 'uid 用户id ----- ')
    await PinsModal.findById({
      _id: pins_id
    }).exec().then(async pins => {
      console.log(pins, 'pins ----')
      if(!pins) {
        ctx.body = {
          code: 200,
          message: 'pins为null'
        }
      }
      const pins_prizelist = pins.toObject().pins_prize || [];
      console.log('pins_prizelist --- ', pins_prizelist)
      const isExistPrizeUser = pins_prizelist.includes(uid)
      const newPinsPrizeList = isExistPrizeUser ? pins_prizelist.filter(item => item !== uid) : [
        ...pins_prizelist,
        uid
      ]
      await PinsModal.updateOne({
        _id: pins_id
      }, {
        pins_prize: newPinsPrizeList
      }).exec().then(updatePins => {
        console.log('更新之后的数据', updatePins);
        ctx.body = {
          code: 200,
          message: isExistPrizeUser ? '取消点赞' : '点赞成功',
          data: {}
        }
      })
    });

  }

  findUserById = async (ctx) => {
    const authorization = ctx.request.header.authorization;

    if (authorization) {
      let { openid = '' } = getJWTPayload(authorization);
      return openid
    }
  }

}


module.exports = new PinsController();
