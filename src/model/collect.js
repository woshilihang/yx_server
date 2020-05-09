const Mongoose = require('mongoose')

const Schema = Mongoose.Schema

const ColectModal = new Schema({
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
  collect_origin: {
    type: String,
    default: '',
    required: true
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

module.exports = Mongoose.model('collect', ColectModal);
