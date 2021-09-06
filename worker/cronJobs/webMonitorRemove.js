/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-03-17 11:34:10
 * @LastEditTime: 2021-09-06 13:55:59
 * @Description: 删除过期的监控记录和map文件
 * @FilePath: /strick/shin-server/worker/cronJobs/webMonitorRemove.js
 */
import schedule from "node-schedule";
import moment from "moment";
import { setCronFormat } from "../../utils";
import services from "../../services";

async function monitor() {
  logger.info("开始执行监控日志的删除");
  const startTimestamp = Date.now();
  //删除7天前的记录
  const twoWeek = moment().add(-7, 'days').startOf('day').format("YYYY-MM-DD HH:mm");
  await services.webMonitor.delExpiredMonitor({ deadline: twoWeek });

  //删除21天前的文件 需要调用删除接口
  // await services.webMonitor.delExpiredMap({ day:21 });
  
  setCronFormat({ name: "监控日志的删除", startTimestamp });
}
module.exports = () => {
  // 每日凌晨3点执行
  schedule.scheduleJob("0 0 3 * * *", monitor);
  // schedule.scheduleJob("*/10 * * * * *", monitor);
};
