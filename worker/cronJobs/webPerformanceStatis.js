/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-03-23 18:04:48
 * @LastEditTime: 2021-09-06 13:27:47
 * @Description: 性能数据统计
 * @FilePath: /strick/shin-server/worker/cronJobs/webPerformanceStatis.js
 */
import schedule from "node-schedule";
import monitor from './webPerformanceStatis-func';
module.exports = () => {
  // 每日凌晨3点半执行
  schedule.scheduleJob("0 30 3 * * *", monitor);
  // schedule.scheduleJob("*/10 * * * * *", monitor);
};
