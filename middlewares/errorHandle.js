/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-02-02 16:24:43
 * @LastEditTime: 2023-04-25 17:18:34
 * @Description: 所有路由错误处理
 * @FilePath: /strick/shin-server/middlewares/errorHandle.js
 */
export default () => async (ctx, next) => {
  try {
    await next();
    // 在响应头中自定义 req-id，实现全链路监控
    ctx.set('Access-Control-Expose-Headers', 'req-id');
    ctx.set('req-id', ctx.req.id);
  } catch (error) {
    logger.error(ctx.path, error, ctx.path);
    ctx.status = 500;
    ctx.body = { error: String(error), reqId: ctx.req.id };
  }
};
