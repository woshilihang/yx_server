const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 创建我们的岗位model
const JobModal = new Schema({
  uid: {
    type: String,
  },
  job_type: {
    type: String,
    default: '',
  },
  job_city: {
    type: Array,
    default: []
  },
  job_name: String,
  job_email: {
    type: String,
    default: '',
    trim: true
  },
  job_origin: {
    type: String,
    default: 'hr发布',
  },
  job_desc: {
    type: String,
    default: ''
  },
  job_isOffical: {
    type: Boolean,
    default: false
  }, // 是否可转正
  job_company: {
    type: Object,
    default: {
      companyName: '未知', // 公司名称
      imgUrl: 'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=181494836,3893697364&fm=26&gp=0.jpg',
      moto: '这是我们公司的口号',
    }
  },
  createAt: {
    type: Date,
    default: Date.now()
  },
  updateAt: {
    type: Date,
    default: Date.now()
  },
});


module.exports = mongoose.model('Job', JobModal);