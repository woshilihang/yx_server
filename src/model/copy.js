const Mongoose = require('mongoose')

const Schema = Mongoose.Schema

// 拷贝内容modal
const CopyModal = new Schema({
  uid: {
    type: String,
    default: '',
    required: true
  },
  content_id: {
    type: String,
    default: '',
    required: true
  },
  copy_val: {
    type: String,
    default: ''
  }
});

module.exports = Mongoose.model('copy', CopyModal);
