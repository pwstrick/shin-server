/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-04-21 17:23:23
 * @LastEditTime: 2023-04-24 18:13:40
 * @Description: 任务队列
 * @FilePath: /strick/shin-server/utils/queue.js
 */
import kue from 'kue';
import config from 'config';

const redisConfig = config.get('kueRedis');
const queue = kue.createQueue({
  prefix: 'q',
  redis: redisConfig,
});
// queue.setMaxListeners(1000)
export default queue;