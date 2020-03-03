// 接受客户端的参数 -> 调用数据层处理 -> 响应客户端返回值
const request = require('request');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { appid, appSecret, mdSecret, grant_type, grant_url } = require('../config/app');
const WXBizDataCrypt = require('../utils/WXBizDataCrypt');

class Login {
  constructor() {

  }

  /**
   *
   * 获取openId, session_key
   * @memberof Login
   */
  getAppId = (opts) => {
    const { appid = '', secret = '', code = '' } = opts;
    return new Promise((resolve, reject) => {
      request.get({
        url: grant_url,
        json: true,
        qs: {
          grant_type,
          appid,
          secret,
          js_code: code
        }
      }, (err, res, body) => {
        if (!err && res.statusCode === 200) {
          resolve(body);
        } else {
          reject();
        }
      })
    });
  }

  loginAction = async (ctx) => {
    // 调用/user.login
    const { encryptedData, code, iv } = ctx.query;
    // 开始获取openId && session_key
    const resultData = await this.getAppId({
      appid,
      secret: appSecret,
      code
    });
    // 解密微信签名，获取用户信息
    const decode = new WXBizDataCrypt(appid, resultData.session_key);
    const userInfo = decode.decryptData(encryptedData, iv);
    console.log('encryptedData --', encryptedData);
    console.log('解密后的数据 ---', userInfo);
    // 引入用户的model
    const WeChatUser = mongoose.model('User');

    // 查询用户信息
    await WeChatUser.findOne({
      openid: resultData.openid
    }).exec()
      .then(async result => {
        // 设置token格式
        const userToken = {
          openid: resultData.openid
        };

        if (!result) {
          // 首次生成token，有效期为7天
          const token = jwt.sign(userToken, mdSecret, {
            expiresIn: 60 * 60 * 24 * 7
          })

          const NewWechatUser = new WeChatUser({
            // 用户信息入库
            avatar: userInfo.avatarUrl,
            nickName: userInfo.nickName,
            openid: resultData.openid,
            token: token,
          });

          try {
            const _save = await NewWechatUser.save()
            console.log('[mongoSave]', _save)
            //成功返回code=200，并返回成sessionKey
            ctx.body = {
              statusCode: 200,
              message: '登录成功, 用户信息入库成功',
              Token: token,
              sessionKey: resultData.session_key
            };
          } catch (err) {
            console.log('[tokenSave]', err);
            ctx.body = {
              statusCode: 500,
              message: '参数错误',
              data: error
            }
          }

        } else {
          // 已添加token
          const token = result.token;
          console.log('token 校验下面开始 --', token);
          try {
            // token校验
            await jwt.verify(token, mdSecret);
            // TODO: 未过期 session_key变更是否要更新用户信息数据
            console.log('校验')
            ctx.body = {
              statusCode: 200,
              message: '登录成功，用户已入库',
              Token: token,
              sessionKey: resultData.session_key
            }
          } catch (err) {
            console.log(err);
            if (err && err.name == 'TokenExpiredError') {
              // token失效
              const token = jwt.sign(userToken, mdSecret, {
                expiresIn: 60 * 60 * 24
              });
              // 更新token
              const _update = WeChatUser.updateOne(mdSecret, token);
              console.log('[mongoUpdate]', _update)
              ctx.body = {
                statusCode: 200,
                message: '登录成功，Token更新成功',
                Token: token,
                sessionKey: resultData.session_key
              };
            } else {
              console.log('[tokenVerify]', err)
              ctx.body = {
                statusCode: 500,
                message: '服务器内部错误',
                data: err
              }
            }
          }
        }

      });

  }

  testAction = async (ctx) => {
    // const { token } = ctx.request.body;
    const token = ctx.request.header.authorization;
    console.log('token -- ', token);
    if (token) {
      let toke = token.split(' ')[1];
      // 解析
      let decoded = jwt.decode(toke, mdSecret);
      // {
      //   exp: 1582254016
      //   iat: 1582167616
      //   openid: "ooogy1Ti2bUO9LFbFa26e8ctyIXk"
      // }
      if(decoded && decoded.exp <= new Date() / 1000) {
        ctx.body = {
          statusCode: 401,
          message: 'token过期了'
        }
      } else {
        ctx.body = {
          message: '解析成功',
          statusCode: 200,
        }
      }
      ctx.body = {
        decoded
      }
    } else {
      ctx.body = {
        message: '没有token',
        code: 0
      }
    }
    // ctx.body={
    //   token
    // }
  }


}

module.exports = new Login();