const path = require('path');

const Router = require('@koa/router');
const multer = require('@koa/multer');

const router = new Router();

const storage = multer.diskStorage({
  // 文件保存路径
  destination: (req, file, cb) => {
    console.log('file ---', file)
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  // 修改文件名称
  filename: (req, file, cb) => {
    const fileFormat = (file.originalname).split('.'); // 取后缀名
    cb(null, `${Date.now()}.${fileFormat[fileFormat.length - 1]}`);
  }
});

// 加载配置
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20, // 限制文件大小
  }
});

router.post('/api/upload', upload.single('file'), async (ctx, next) => {
  // 返回原文件名
  const singleFile = ctx.request.file;
  let name = singleFile && singleFile.originalname;
  let url = `/uploads/${name}`;

  ctx.body = {
    code: 200,
    name,
    url,
    userInfo: ctx.request.body
  }
});

module.exports = router;