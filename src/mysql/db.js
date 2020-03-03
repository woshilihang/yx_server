const Sequelize = require('sequelize');

const { databaseConf } = require('../config/default');

const { database_name, user, password, host } = databaseConf;

const db = new Sequelize(database_name, user, password, {
  host,
  dialect: 'mysql',
  logging: false, // nodemon里面不显示原始查询语句
});

module.exports = {
  db,
}
