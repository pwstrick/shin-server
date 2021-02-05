import Sequelize from 'sequelize';
import config from 'config';
import bunyan from 'bunyan';

const mysql = {};
const mysqlServers = config.get('mysql');
const logger = bunyan.createLogger({ name: 'Mysql', level: 'debug' });
const create = (params) => {
  const { database, username, password, options } = params;
  return new Sequelize(database, username, password, {
    ...options,
    logging: (msg, benchmark) => logger.debug(msg, `${benchmark}ms`),
  });
};
Object.keys(mysqlServers).forEach((item) => {
  mysql[item] = create(mysqlServers[item]);
  mysql[item].authenticate().then(() => {
    logger.info(`${item} mysql connected success`);
  }).catch((error) => {
    logger.error(`${item} mysql 连接错误: ${error.toString()}`);
  });
});

global.Sequelize = Sequelize;
export default mysql;
