import express, { ErrorRequestHandler } from "express";
import dbPool from "./common/dbPool";
import logger from "./common/logger";
import { registerController } from "./common/router";

console.log('服务启动中...');
(async function start() {
    //初始化测试连接池
    await dbPool.initPools();
    //初始化服务
    const app: express.Application = express();
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.raw({ limit: '10mb' }));

    // 允许跨域
    app.use((req, res, next) => {
        //设置允许跨域的域名，*代表允许任意域名跨域
        res.header("Access-Control-Allow-Origin", "*");
        //允许的header类型
        res.header("Access-Control-Allow-Headers", "content-type");
        //跨域允许的请求方式
        res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
        //业务处理
        next();
    });

    //主页
    app.get('/', (req, res) => res.send('Hello World!'));

    //页面
    app.use('/web', express.static(__dirname + '/web'));

    //扫描并注册路由
    registerController(app, 'controller', '/service');

    //异常处理
    app.use(<ErrorRequestHandler>((err, req, res, next) => {
        res.status(200).json({ code: 500, msg: err.message || '服务器调用异常!' });
        logger.error('服务调用异常!', req.url, err);
        console.error('服务调用异常!', req.url, err);
    }));
    //开启服务监听
    app.listen(3000, () => {
        console.log('服务已启动!');
        console.log('http://localhost:3000')
    });

})();
