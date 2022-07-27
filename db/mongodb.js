import mongoose from 'mongoose';
import config from 'config';
// import bunyan from 'bunyan';
import Promise from 'bluebird';

// const logger = bunyan.createLogger({ name: 'Mongodb', level: 'debug' });
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
