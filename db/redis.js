import Redis from 'ioredis';
import config from 'config';

const connections = {};
const redisServers = config.get('redis');

Object.keys(redisServers).forEach((item) => {
  const redisConfig = redisServers[item];
  let client;
  // 如果配置项是数组则使用 cluster 模式连接
  if (Array.isArray(redisConfig)) {
    client = new Redis.Cluster(redisConfig);
  } else {
    client = new Redis(redisConfig);
  }
  client.on('error', (err) => {
    logger.error(`${item} redis error: ${err}`);
  });
  client.on('ready', () => {
    logger.info(`${item} redis connected`);
  });
  connections[item] = client;
});

export default connections;

