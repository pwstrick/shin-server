/*
 * @Author: strick
 * @Date: 2021-02-02 16:24:43
 * @LastEditTime: 2021-02-03 18:34:31
 * @LastEditors: strick
 * @Description: 验证当前用户的操作权限
 * @FilePath: /strick/shin-server/middlewares/checkAuth.js
 */
import redis from '../db/redis';

export default authority => async (ctx, next) => {
  const { id } = ctx.state.user;
  const res = await redis.aws.get(`backend:user:account:authorities:${id}`);
  if (!res) {
    ctx.status = 409;
    ctx.body = { error: '服务升级，请重新登录' };
    return;
  }
  const authorities = res.split(',');
  if (authorities.includes(authority) || authorities[0] === '*') {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = { error: '您没有操作权限' };
  }
};
