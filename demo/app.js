const Koa = require('koa')
const Router = require('@koa/router')
const router = new Router()
const server = require('koa-static');
const multer = require('@koa/multer')
const path = require('path')
const app = new Koa();

const config = require('../src/config/default');

app.use(server(path.resolve(__dirname, './static')));

//上传文件存放路径、及文件命名
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname ,'/public'))
    },
    filename: function (req, file, cb) {
        let type = file.originalname.split('.')[1]
        cb(null, `${file.fieldname}-${Date.now().toString(16)}.${type}`)
    }
})
//文件上传限制
const limits = {
    fields: 10,//非文件字段的数量
    fileSize: 500 * 1024,//文件大小 单位 b
    files: 1//文件数量
}
const upload = multer({storage,limits})

router.post('/user/file', upload.single('file'), async (ctx,next)=>{
    ctx.body = {
        code: 1,
        data: ctx.file
    }
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(config.port);