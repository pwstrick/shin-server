/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-02-02 16:22:30
 * @LastEditTime: 2023-04-24 18:11:27
 * @Description: 中间件配置
 * @FilePath: /strick/shin-server/middlewares/index.js
 */
import checkAuth from './checkAuth';
import checkExport from './checkExport';
import errorHandle from './errorHandle';

const middleswares = {
  checkAuth,
  checkExport,
  errorHandle
};

export default middleswares;
