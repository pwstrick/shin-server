/*
 * @Author: strick
 * @Date: 2021-02-02 16:13:00
 * @LastEditTime: 2023-04-27 18:05:24
 * @LastEditors: strick
 * @Description: 启动文件
 * @FilePath: /strick/shin-server/app.js
 */
import Koa from 'koa';
import KoaRouter from 'koa-router';
import KoaCompress from 'koa-compress';
import KoaBodyParser from 'koa-bodyparser';
import KoaValidate from 'koa-validate';
import KoaStatic from 'koa-static';
import koaBunyanLogger from 'koa-bunyan-logger';
import jwt from 'koa-jwt';
import config from 'config';
import pino from 'pino';
import koaPinoLogger from 'koa-pino-logger';
import routers from './routers/';
import errorHandle from './middlewares/errorHandle';
import init from './init';

const app = new Koa();
const router = new KoaRouter();

/**
 * 基于 OpenTracing 标准的分布式追踪系统，有助于分析服务架构中的计时数据
 * https://github.com/openzipkin/zipkin-js
 */
// import { Tracer, ConsoleRecorder, ExplicitContext } from 'zipkin';
// import { koaMiddleware } from 'zipkin-instrumentation-koa';
// const ctxImpl = new ExplicitContext();
// const recorder = new ConsoleRecorder();
// const tracer = new Tracer({recorder, ctxImpl, localServiceName: 'zipkin-koa-shin'});
// app.use(koaMiddleware({tracer}));


/**
 * 全链路日志追踪
 * https://github.com/puzpuzpuz/cls-rtracer
 */
const rTracer = require('cls-rtracer');

global.logger = pino({
  name: 'shin-server',
  level: 'trace',
  mixin () {
    return { 'req-id': rTracer.id() }
  },
  hooks: {
    // 格式化日志
    logMethod (inputArgs, method) {
      const printfs = [];
      for(let i=0; i<inputArgs.length; i++) {
        switch(typeof inputArgs) {
          case 'object':
            printfs.push('%o');
            break;
          case 'number':
            printfs.push('%d');
            break;
          default:
            printfs.push('%s');
        }
      }
      return method.apply(this, [printfs.join(' '), ...inputArgs])
    }
  }
});

// 基于 Async Hooks 的全链路追踪
app.use(rTracer.koaMiddleware());

/**
 * pino 的 KOA 中间件
 * https://github.com/pinojs/koa-pino-logger
 * 配置信息参考 pino-http
 * https://github.com/pinojs/pino-http
 */
app.use(koaPinoLogger({
  autoLogging: false,   // 省略request completed
  serializers: {
    req: req => req.id,
    res: () => undefined,
  },
  customAttributeKeys: {
    req: 'req-id',
  },
  genReqId: () => rTracer.id(),   // 声明 req-id 的值
}));

app.use(KoaCompress());
app.use(KoaBodyParser({ jsonLimit: '10mb', textLimit: '10mb', enableTypes: ['json', 'form', 'text'] }));
app.use(KoaStatic('static'));
app.use(KoaStatic('upload'));
app.use(jwt({
  secret: config.get('jwtSecret'),    //401 Unauthorized
}).unless({
  path: [/user\/login/, /user\/init/, /\/download/, /common\/upload/, /pe\.gif/, /ma\.gif/, /smap\/del/, /callback/],  //跳过登录态的请求
}));
app.use(errorHandle());
app.use(koaBunyanLogger.requestLogger({
  updateLogFields(fields) {
    delete fields.req;
    delete fields.res;
    fields.operator = this.state.user && this.state.user.realName;
  },
}));

app.use(router.routes());
app.use(router.allowedMethods());

routers(router);
KoaValidate(app);

app.listen(config.get('port'));

logger.info(`Server started on ${config.get('port')}`);

//开始处理任务
init();