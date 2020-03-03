const mongoose = require('mongoose');



const startConnectMongo = () => {
  mongoose.Promise = Promise;

  mongoose.connect('mongodb://127.0.0.1:27017/yx_server', {
    useNewUrlParser: true,
  });

  mongoose.connection.on("error", function (error) {
    console.log("数据库连接失败：" + error);
  });
  mongoose.connection.on("open", function () {
    console.log("------数据库连接成功！------");
  });
}

module.exports = startConnectMongo;