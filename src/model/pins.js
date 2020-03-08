const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const PinsModal = new Schema({
  uid: {
    type: String,
  },
  pins_desc: {
    type: String,
    default: ''
  },
  pins_imgList: {
    type: Array,
    default: [],
  },
  pins_prize: {
    type: Number,
    default: 0,
  },
  pins_collect: {
    type: Number,
    default: 0,
  },
  pins_comment: {
    type: Number,
    default: 0
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

module.exports = Mongoose.model('Pins', PinsModal);
