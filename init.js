/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-09-06 12:49:20
 * @LastEditTime: 2021-09-06 12:53:00
 * @Description: 
 * @FilePath: /strick/shin-server/init.js
 */
import queue from './utils/queue';
import services from './services';

export default () => {
    //处理性能数据
    queue.process('handlePerformance', (job, done) => {
      services.webMonitor.createPerformance(job.data.performance)
        .then(() => done())
        .catch((err) => {
          logger.error(err);
          done(err);
        });
    });

    //处理监控数据
    const taskName = 'handleMonitor';
    queue.process(taskName, (job, done) => {
      logger.trace(`${taskName} job begin`, job.id);
      services.webMonitor.handleMonitor(job.data.monitor)
        .then(() => {
            done();
            logger.trace(`${taskName} job completed`, job.id);
            job.remove(function(){//手动移除
              logger.trace(`${taskName} job removed`, job.id);
            });
        })
        .catch((err) => {
            logger.error(err);
            done(err);
        });
    });
}