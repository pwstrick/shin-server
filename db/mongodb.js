/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-02-02 16:18:02
 * @LastEditTime: 2023-04-24 18:09:48
 * @Description: MongoDB配置
 * @FilePath: /strick/shin-server/db/mongodb.js
 */
import mongoose from 'mongoose';
import config from 'config';

mongoose.set('debug', (...args) => {
  if (args[0] !== 'agendaJobs') {
    logger.debug(...args);
  }
});

const mongooseConfig = config.get('mongodb');
const url = `mongodb://${mongooseConfig.hosts.join(',')}`;
mongoose.connect(url, {
  poolSize: 10,
  useNewUrlParser: true,
  ...mongooseConfig.options,
  promiseLibrary: Promise,
});
const db = mongoose.connection;

db.once('open', () => {
  logger.info('mongodb connected');
});
db.on('error', (err) => {
  logger.error(`mongodb err: ${err}`);
});

export default mongoose;
