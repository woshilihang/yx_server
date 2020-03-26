const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const WeChatAPI = require('co-wechat-api');
const axios = require('axios');

const { appid, appSecret } = require('../config/app');

const WXAppApi = new WeChatAPI(appid, appSecret);

const sha1 = (msg) => crypto.createHash('sha1').update(msg, 'utf8').digest('hex')

module.exports = {
  async getWxCodeUnlimit({ page, scene }) {
    // 图片文件名使用page和scene等数据生成hash，以避免重复生成相同的小程序码
    const fileName = sha1(page + scene);
    const filePath = path.join(__dirname, `../public/qrcode/${fileName}.png`);

    let readable;

    try {
      // 检测该名字的小程序码图片文件是否存在
      await bluebird.promisify(fs.access)(filePath, fs.constants.R_OK);
      readable = fs.createReadStream(filePath)
    } catch (err) {
      // 小程序码不存在，则创建一张新的
      const token = await WXAppApi.ensureAccessToken()
      const response = await axios({
        method: 'post',
        url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit',
        responseType: 'stream',
        params: { access_token: token.accessToken },
        data: { page, scene }
      })
      readable = response.data
      readable.pipe(fs.createWriteStream(filePath))
    }

    // 返回该小程序码的图片的文件流
    return readable;
  }
}