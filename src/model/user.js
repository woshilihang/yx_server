const mongoose = require('mongoose');
const Schema = mongoose.Schema
//创建我们的用户Schema
const UserSchema = new Schema({
    openid: String,
    nickName: String,
    avatar: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        default: '',
    },
    wx: {
        type: String,
        default: ''
    },
    tel: {
        type:Number,
    },
    gender: { // 性别
        type: String,
        default: ''
    },

    scholl: {
        type: String,
        default: ''
    },
    grade: { // 所读年级
        type: String,
        default: ''
    },

    company: { // 所在公司
        type: String,
        default: ''
    },
    job_type: { // 所在岗位
        type: String,
        default: '',
    },
    job_time: { // 在职时间
        type: String,
        default: '',
    },
    job_img: { // 工作证正面照存储上传之后的线上地址
        type: String,
        default: ''
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    updateAt: {
        type: Date,
        default: Date.now()
    },
    token: String
})


module.exports = mongoose.model('User', UserSchema);