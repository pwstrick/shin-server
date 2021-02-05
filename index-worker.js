/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2020-12-16 19:17:57
 * @LastEditTime: 2021-02-03 15:01:36
 * @Description: 定时任务配置文件
 * @FilePath: /strick/shin-server/index-worker.js
 */
require('babel-core/register');
require('babel-polyfill');

const bunyan = require('bunyan');

global.logger = bunyan.createLogger({
  name: 'Task',
  level: 'trace',
});

global.env = process.env.NODE_ENV || 'development';

const agenda = require('./worker/agenda.js');
//读取命令中带的任务名称（用于调试），例如 JOB_TYPES=? npm run worker   ( ? 代表任务名称，即文件名)
const jobTypes = process.env.JOB_TYPES ? process.env.JOB_TYPES.split(',') : [];

/**
 * 基于时间的定时任务，采用 node-schedule 库
 * https://github.com/node-schedule/node-schedule
 */
if (jobTypes.length) {
  jobTypes.forEach((type) => {
    try {
      require('./worker/cronJobs/' + type)();
    } catch (ex) {

    }
  });
} else {
  require('./worker/cronJobs/demo')();
}

/**
 * 触发型的定时任务，采用 agenda 库
 * https://github.com/agenda/agenda
 */
agenda.on('ready', () => {
  if (jobTypes.length) {
    jobTypes.forEach((type) => {
      try {
        require('./worker/triggerJobs/' + type)(agenda);
      } catch (ex) {

      }
    });
  } else {
    require('./worker/triggerJobs/demo')(agenda);
  }
  agenda.start().catch(error => logger.error('job start error', error));
});

async function graceful() {
  await agenda.stop();
  process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
