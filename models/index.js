/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-02-02 16:22:56
 * @LastEditTime: 2023-04-24 18:11:37
 * @Description: model文件配置
 * @FilePath: /strick/shin-server/models/index.js
 */
import mysql from '../db/mysql';
import mongodb from '../db/mongodb';
import redis from '../db/redis';
import AppGlobalConfig from './AppGlobalConfig';
import BackendUserAccount from './BackendUserAccount';
import BackendUserRole from './BackendUserRole';
import WebMonitor from './WebMonitor';
import WebMonitorRecord from './WebMonitorRecord';
import WebMonitorStatis from './WebMonitorStatis';
import WebPerformance from './WebPerformance';
import WebPerformanceProject from './WebPerformanceProject';
import WebPerformanceStatis from './WebPerformanceStatis';
import WebShortChain from './WebShortChain';

const models = {
  AppGlobalConfig,
  BackendUserAccount,
  BackendUserRole,
  WebMonitor,
  WebMonitorRecord,
  WebMonitorStatis,
  WebPerformance,
  WebPerformanceProject,
  WebPerformanceStatis,
  WebShortChain
};
Object.keys(models).forEach(key => {
  models[key] = models[key]({ mysql, mongodb, redis });
});

// Object.keys(models).forEach((modelName) => {
//   if (models[modelName].associate) {
//     models[modelName].associate(models);
//   }
// });
export default models;

