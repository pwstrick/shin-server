/*
 * @Author: strick
 * @Date: 2021-02-03 14:35:12
 * @LastEditTime: 2021-02-03 15:11:47
 * @LastEditors: strick
 * @Description: 触发任务的demo
 * @FilePath: /strick/shin-server/worker/triggerJobs/demo.js
 */
import services from '../../services';

module.exports = (agenda) => {
  // 例如满足某种条件触发邮件通知
  agenda.define('send email report', (job, done) => {
    // 传递进来的数据
    const data = job.attrs.data;
    console.log(data);
    // 触发此任务，需要先引入 agenda.js，然后调用 now() 方法
    // import agenda from '../worker/agenda';
    // agenda.now('send email report', {
    //   username: realName,
    // });
  });
};
