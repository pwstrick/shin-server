/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-03-17 11:33:41
 * @LastEditTime: 2021-09-06 13:26:35
 * @Description: 监控统计
 * @FilePath: /strick/shin-server/worker/cronJobs/webMonitorStatis.js
 */
import schedule from "node-schedule";
import moment from "moment";
import { MONITOR_PROJECT } from "../../utils/constant";
import { setCronFormat } from "../../utils";
import services from "../../services";

async function monitor() {
  logger.info("开始执行监控统计");
  const startTimestamp = Date.now();
  const date = moment().add(-1, 'days').format("YYYYMMDD");
  //判断当前是否已经包含昨日的统计信息
  const yesterdayStatis = await services.webMonitor.getOneStatis({ date });
  if(yesterdayStatis) {
    logger.info("昨日的监控统计已完成");
    return;
  }
  const yesterday = moment().add(-1, 'days').startOf('day').format("YYYY-MM-DD HH:mm");  //昨天凌晨
  const today = moment().startOf('day').format("YYYY-MM-DD HH:mm");    //今天凌晨
  // const message500 = {message: {$like: '%"status":500%'}};      //500的请求
  // const message502 = {message: {$like: '%"status":502%'}};      //502的请求
  // const message504 = {message: {$like: '%"status":504%'}};      //504的请求
  const message500 = { message_status: 500 };      //500的请求
  const message502 = { message_status: 502 };      //502的请求
  const message504 = { message_status: 504 };      //504的请求
  const statis = {};
  for(let i=0; i<MONITOR_PROJECT.length; i++) {
    const project = MONITOR_PROJECT[i];
    const filter = { project, from: yesterday, to: today };
    const error50XCountFilter = { category: "error", ...filter };
    const errorCount = await services.webMonitor.statisticCount({ category: "error", ...filter });                  //受影响的人数
    const errorSum = await services.webMonitor.statisticSum({ field: "digit", category: "error", ...filter });      //错误出现总数
    const error500Count = await services.webMonitor.statisticCount({ ...error50XCountFilter, other: message500 });  //500总数
    const error502Count = await services.webMonitor.statisticCount({ ...error50XCountFilter, other: message502 });  //502总数
    const error504Count = await services.webMonitor.statisticCount({ ...error50XCountFilter, other: message504 });  //504总数
    const ajaxCount = await services.webMonitor.statisticCount({ category: "ajax", ...filter });                    //通信总数
    const consoleCount = await services.webMonitor.statisticCount({ category: "console", ...filter });              //打印总数
    const eventCount = await services.webMonitor.statisticCount({ category: "event", ...filter });                  //事件总数
    const redirectCount = await services.webMonitor.statisticCount({ category: "redirect", ...filter });            //跳转总数
    let error504 = await services.webMonitor.countErrorAjax({ project, day: date, messageStatus: 504 });            //504路径和次数
    error504 = error504.map(item => [item.message_path, item.count]).sort((left, right) => (right[1] - left[1]));   //倒序排列
    statis[project] = {
      allCount: (errorCount + ajaxCount + consoleCount + eventCount + redirectCount), 
      errorCount,
      errorSum,
      error500Count,
      error502Count,
      error504Count,
      ajaxCount,
      consoleCount,
      eventCount,
      redirectCount,
      error504
    };
  }
  await services.webMonitor.createStatis({ date, statis: JSON.stringify(statis) });
  setCronFormat({ name: "监控统计", startTimestamp });
}
module.exports = () => {
  // 每日凌晨4点执行
  schedule.scheduleJob("0 0 4 * * *", monitor);
  // schedule.scheduleJob("*/10 * * * * *", monitor);
};
