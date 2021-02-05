/**
 * 所有路由错误处理
 */

export default () => async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    logger.error(ctx.path, error, ctx.path);
    ctx.status = 500;
    ctx.body = { error: String(error) };
  }
};
