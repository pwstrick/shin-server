/*
 * @Author: strick
 * @Date: 2021-02-02 16:13:00
 * @LastEditTime: 2021-09-06 13:45:34
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
import bunyan from 'bunyan';
import routers from './routers/';
import errorHandle from './middlewares/errorHandle';
import init from './init';

const app = new Koa();
const router = new KoaRouter();

global.logger2 = bunyan.createLogger({
  name: 'shin-server',
  level: 'trace',
});
global.logger = {
  debug: () => {},
  warn: () => {},
  error: () => {},
  info: () => {},
  trace: () => {},
};
app.use(koaBunyanLogger());
app.use(koaBunyanLogger.requestIdContext());
app.use(KoaCompress());
app.use(KoaBodyParser({ jsonLimit: '10mb', enableTypes: ['json', 'form', 'text'] }));
app.use(KoaStatic('static'));
app.use(KoaStatic('upload'));
app.use(jwt({
  secret: config.get('jwtSecret'),    //401 Unauthorized
}).unless({
  path: [/user\/login/, /user\/init/, /\/download/, /common\/upload/, /pe\.gif/, /ma\.gif/, /smap\/del/],  //跳过登录态的请求
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