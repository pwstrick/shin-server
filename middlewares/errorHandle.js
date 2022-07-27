/**
 * 所有路由错误处理
 */

export default () => async (ctx, next) => {
  try {
    // 当一次通信还没结束时，不允许覆盖reqId
    if (!global.coverLoged) {
      global.coverLoged = true;
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
    }
    await next();
    global.coverLoged = false;
  } catch (error) {
    logger.error(ctx.path, error, ctx.path);
    ctx.status = 500;
    ctx.body = { error: String(error) };
  }
};
