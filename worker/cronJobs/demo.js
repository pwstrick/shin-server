/*
 * @Author: strick
 * @Date: 2021-02-03 14:35:06
 * @LastEditTime: 2021-02-03 14:59:07
 * @LastEditors: strick
 * @Description: 定时任务的demo
 * @FilePath: /strick/shin-server/worker/cronJobs/demo.js
 */
import schedule from 'node-schedule';
import services from '../../services';
function test(result) {
  console.log(result);
}
module.exports = async () => {
  const result = await services.backendUserAccount.find();
  //每 30 秒执行一次定时任务
  schedule.scheduleJob({ rule: "*/30 * * * * *" }, () => {
    test(result);
  });
};
