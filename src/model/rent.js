const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const RentModal = new Schema({
  uid: {
    type: String,
  },
  rent_origin: {
    type: String,
    default: 'findHouse'
  },
  latitude: String,
  longitude: String,
  rent_imgList: {
    type: Array,
    default: [],
  },
  rent_city: {
    type: String,
    default: ''
  },
  rent_desc: {
    type: String,
    default: ''
  },
  rent_price: {
    type: String,
    default: ''
  },
  rent_canShortRent: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
    default: '',
  },
  rent_tel: {
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
});

module.exports = Mongoose.model('Rent', RentModal);
