/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-07-07 14:28:38
 * @LastEditTime: 2021-09-06 13:27:35
 * @Description: 监控后台告警
 * @FilePath: /strick/shin-server/worker/cronJobs/webMonitorWarn.js
 */
import schedule from "node-schedule";
import moment from "moment";
import { setCronFormat } from "../../utils";
import services from "../../services";
// 监控对象
const monitor = {
  'test': '测试页面',
};
// 接收邮箱
const emails = [
  'test@shin.org',
];
async function send(text) {
  for(let value of emails) {
    await services.webMonitor.tenantSend({ email: value, text });
  }
}
async function warn() {
  logger.info("开始执行监控告警");
  const startTimestamp = Date.now();
  const from = moment().add(-5, 'minutes').format("YYYY-MM-DD HH:mm"),  //计算前5分钟
    to = moment().format("YYYY-MM-DD HH:mm");
  for(let key in monitor) {
    const amount = await services.webMonitor.statisticCount({
      from,
      to,
      other: {
        project_subdir: key
      }
    });
    if(amount < 20) {   // 当请求量小于20时，发送白屏警告
      const text = `${monitor[key]}白屏异常`;
      await send(text);
    }
  }
    
  setCronFormat({ name: "监控告警", startTimestamp });
}
module.exports = () => {
  // 每5分钟运行一次
  // schedule.scheduleJob("0 */5 * * * *", warn);
  // schedule.scheduleJob("*/10 * * * * *", warn);
};