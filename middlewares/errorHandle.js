/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-02-02 16:24:43
 * @LastEditTime: 2023-04-24 15:50:19
 * @Description: 所有路由错误处理
 * @FilePath: /strick/shin-server/middlewares/errorHandle.js
 */
export default () => async (ctx, next) => {
  try {
    logger.debug = (...args) => {
      logger2.debug(ctx.reqId, ...args);
    };
    logger.warn = (...args) => {
      logger2.warn(ctx.reqId, ...args);
    };
    logger.info = (...args) => {
      logger2.info(ctx.reqId, ...args);
    };
    logger.trace = (...args) => {
      logger2.trace(ctx.reqId, ...args);
    };
    logger.error = (...args) => {
      logger2.error(ctx.reqId, ...args);
    };
    await next();
    // 在响应头中自定义 req-id，实现全链路监控
    ctx.set('Access-Control-Expose-Headers', 'req-id');
    ctx.set('req-id', ctx.reqId);
  } catch (error) {
    logger.error(ctx.path, error, ctx.path);
    ctx.status = 500;
    ctx.body = { error: String(error), reqId: ctx.reqId };
  }
};
