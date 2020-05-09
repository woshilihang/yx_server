const RentModal = require('../model/rent');
const UserModal = require('../model/user');

const { getJWTPayload } = require('../utils/index');

class RentController {
  constructor() { }

  publishPins = async ctx => {
    const {
      rent_origin,
      latitude,
      longitude,
      rent_imgList,
      rent_city,
      rent_desc,
      rent_price,
      rent_canShortRent,
      gender,
      rent_tel
    } = ctx.request.body;

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
            rent_origin,
            latitude,
            longitude,
            rent_imgList,
            rent_city,
            rent_desc,
            rent_price,
            rent_canShortRent,
            gender,
            rent_tel
          };
          console.log('params --- ', saveParams);
          const NewRentInfoModal = new RentModal(saveParams);
          try {
            const _save = await NewRentInfoModal.save();
            console.log('[mongoSave]', _save)
            ctx.body = {
              code: 200,
              message: '租房信息发布成功',
              data: {
                rent_id: _save._id,
                uid: openid
              }
            }
          } catch (err) {
            console.log('[mongoSaveError]', err);
            ctx.body = {
              code: 500,
              message: '租房信息发布失败',
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

          const pins_prizelist = restObj.pins_prize || [];
          const isExistPrizeUser = pins_prizelist.includes(openid)

          let tempData = Object.assign({}, restObj, { [`${doc}_id`]: doc._id },
            {
              userInfo: {
                nickName,
                avatar,
                company,
                job_type
              },
              pins_prize_self: isExistPrizeUser,
              pins_prize_num: pins_prizelist.length
            }
          );
          resolve(tempData);
        } else {
          reject(false)
        }
      });
    });
  }

  getRentList = async ctx => {
    // 1 升序 -1 降序 需要这种参数格式的参数为 price 
    // 无房找房源 house 2 有房找室友 house 1
    const { city = '', price = '', sex = '', house = '', canShortRent = '', keyword = '', nextPageNum=1 } = ctx.query;

    let queryTypes = {}
    await RentModal.countDocuments({
      $and: [
        city ? { rent_city: city }: {},
        sex ? { gender: sex == 1 ? '男' : '女' }: {},
        house ? { rent_origin: house == 2 ? 'findHouse' : 'findFriend' }: {},
        // 如果传false还是需要传递过滤该参数
        (canShortRent || canShortRent != false) ? { rent_canShortRent: canShortRent }: {}
      ]
    }).exec().then(async count => {
      await RentModal.find({
        $and: [
          city ? { rent_city: city }: {},
          sex ? { gender: sex == 1 ? '男' : '女' }: {},
          house ? { rent_origin: house == 2 ? 'findHouse' : 'findFriend' }: {},
          // 如果传false还是需要传递过滤该参数
          (canShortRent || canShortRent != false) ? { rent_canShortRent: canShortRent }: {}
        ]
      }, {
        rent_desc: 1,
        _id: 1,
        rent_imgList: 1,
        rent_origin: 1,
        uid: 1
      }, {
        skip: (nextPageNum - 1) * 2, // 相当于页数
        limit: 5, // 相当于每页个数
        sort: Object.assign({}, {
          createAt: -1,
        }, price ? {
          price
        } : {})
      }
      ).exec().then(async doc => {
        let waitReqArr = [];

        [...doc].forEach(rent => {
          waitReqArr.push(this.handleGetData(rent, rent.uid, true));
        });

        await Promise.all(waitReqArr).then(res => {
          console.log('返回的数组集合', res);
          ctx.body = {
            code: 200,
            message: '获取租房信息成功',
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
            message: '获取租房信息失败',
            data: {}
          }
        });

      });
    })
  }


  getRentDetail = async ctx => {
    const { rent_id } = ctx.query;

    const authorization = ctx.request.header.authorization;
    if (authorization) {

      const { openid } = getJWTPayload(authorization);
      await UserModal.findOne({
        openid
      }, {
        avatar: 1,
        company: 1,
        gender: 1,
        nickName: 1
      }).exec().then(async userInfo => {
        if (userInfo) {
          await RentModal.findOne({
            _id: rent_id
          }).exec().then(res => {
            const {
              rent_origin,
              latitude,
              longitude,
              rent_imgList,
              rent_city,
              rent_desc,
              rent_price,
              rent_canShortRent,
              gender,
              rent_tel
            } = res;
            ctx.body = {
              code: 200,
              msg: '获取详情信息成功',
              data: {
                rent_origin,
                latitude,
                longitude,
                rent_imgList,
                rent_city,
                rent_desc,
                rent_price,
                rent_canShortRent,
                gender,
                rent_tel,
                userInfo
              }
            }
          });
        } else {
          ctx.body = {
            code: 401,
            message: '用户不存在，token无效',
            data: {}
          };
        }
      });
    }


  }

}

module.exports = new RentController();