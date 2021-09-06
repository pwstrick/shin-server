/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-03-23 18:05:06
 * @LastEditTime: 2021-09-06 13:56:31
 * @Description: 性能数据清除
 * @FilePath: /strick/shin-server/worker/cronJobs/webPerformanceRemove.js
 */
import schedule from "node-schedule";
import moment from "moment";
import { setCronFormat } from "../../utils";
import services from "../../services";

async function monitor() {
  logger.info("开始执行性能日志的删除");
  const startTimestamp = Date.now();
  //删除28天前的记录
  const fourWeek = moment().add(-28, 'days').startOf('day').format("YYYYMMDD");
  await services.webMonitor.delExpiredPerformance({ deadline: fourWeek });
  await services.webMonitor.delExpiredPerformanceStatis({ deadline: fourWeek });

  setCronFormat({ name: "性能日志的删除", startTimestamp });
}
module.exports = () => {
  // 每日凌晨4点半执行
  schedule.scheduleJob("0 30 4 * * *", monitor);
  // schedule.scheduleJob("*/10 * * * * *", monitor);
};
