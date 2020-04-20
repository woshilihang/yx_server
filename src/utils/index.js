const jwt = require('jsonwebtoken');
const { mdSecret } = require('../config/app');
// const
// 这里做一个常用公司数据信息保存，如果这里没有就去数据库存获取把用户导向去新建一个公司名称，及上传公司logo
// companyName 不能重复，独一无二的
const companyListData = [
  {
    companyName: '小米', // 精确匹配
    keyword: '探索黑科技，小米为发烧而生', // 模糊匹配
    imgUrl: 'https://uploadfiles.nowcoder.com/images/20180918/4107856_1537253829973_FE8E552D9F284C2F083267D8EC135526'
  },
  {
    companyName: '腾讯',
    keyword: '一切以用户价值为依归',
    imgUrl: 'https://uploadfiles.nowcoder.com/files/20190715/9398821_1563179722928_120.png',
  },
  {
    companyName: '阿里',
    keyword: '让天下没有难做的生意',
    imgUrl: 'https://uploadfiles.nowcoder.com/images/20180917/4107856_1537180998772_EA0EB791BBE9BECA5981335580CD0F58',
  },
  {
    companyName: '字节跳动',
    keyword: '全球创作与交流平台',
    imgUrl: 'https://uploadfiles.nowcoder.com/files/20191129/4107856_1575019780091_60x60.png',
  },
  {
    companyName: '百度',
    keyword: '百度一下，你就知道',
    imgUrl: 'https://uploadfiles.nowcoder.com/images/20180917/4107856_1537181125149_471D6CEB9F3691513D7B5CE2545E1818',
  },
  {
    companyName: '美团',
    keyword: '吃喝玩乐全都有',
    imgUrl: 'https://uploadfiles.nowcoder.com/files/20190629/4107856_1561788901920_120x120.png',
  },
  {
    companyName: '京东',
    keyword: '技术引领，正道成功',
    imgUrl: 'https://uploadfiles.nowcoder.com/images/20180917/4107856_1537181614088_15ADCE1EF9544F27FFAF92B10CF15BF5',
  },
  {
    companyName: '滴滴出行',
    keyword: '滴滴一下，美好出行',
    imgUrl: 'https://uploadfiles.nowcoder.com/images/20180917/4107856_1537181213012_6A26EF59C4E0E6CB623831801FDB15F0',
  },
  {
    companyName: '网易有道',
    keyword: '让语言工作和学习交流更加轻松有效',
    imgUrl: 'https://images.nowcoder.com/images/20190129/301537_1548727018891_534B60D89A362FABBEA6D8DA488BC111?x-oss-process=image/resize,m_mfit,h_60,w_60',
  }
];

const NotMatchMsg = {
  imgUrl: ''
};

const matchCompany = (name) => {
  // 针对公司数据做匹配
  const matched = companyListData.filter(company => {
    return company.companyName === name || company.keyword.includes(name)
  });
  if (!matched.length) return { companyName: name, ...NotMatchMsg };

  console.log('matched company detail----', matched);
  return matched[0];
};

module.exports = {
  companyListData,
  matchCompany,
  getJWTPayload
};


/* 通过token获取JWT的payload部分 */
function getJWTPayload(token) {
  // 验证并解析JWT
  return jwt.verify(token.split(' ')[1], mdSecret);
}
