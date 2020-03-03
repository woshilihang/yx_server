const mysql = require('mysql');

const { databaseConf }  = require('../config/default');

const { host, user, password, database_name: database } = databaseConf;
const pool = mysql.createPool({
  host,
  user,
  password,
  database
});


class Mysql {
  constructor() {
    
  }

  query() {
    return new Promise((resolve, reject) => {
      pool.query(`SELECT * from ${'network3'}`, (err, res, fields) => {
        if(err) reject(err);

        resolve(res);
        console.log('res', res);
      })
    });
  }
}


module.exports = new Mysql();