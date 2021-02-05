/*
 * @Author: strick
 * @Date: 2021-02-02 16:17:36
 * @LastEditTime: 2021-02-05 16:04:36
 * @LastEditors: strick
 * @Description: 本地配置文件
 * @FilePath: /strick/shin-server/config/development.js
 */
module.exports = {
    port: 6060,
    jwtSecret: 'abcd',
    /**
     * 数据库相关配置
     */
    mongodb: {
      hosts: [
        '127.0.0.1:27017',
      ],
      options: {
        dbName: 'shin_backend',
      },
    },
    redis: {
      aws: {
        host: '127.0.0.1',
        port: 6379,
      },
    },
    mysql: {
      backend: {
        database: 'shin_backend',
        username: null,
        password: null,
        options: {
          dialect: 'mysql',
          port: 3306,
          replication: {
            read: [
              { host: '127.0.0.1', username: 'root', password: '123' },
            ],
            write: { host: '127.0.0.1', username: 'root', password: '123' },
          },
          benchmark: true,
          dialectOptions: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            supportBigNumbers: true,
            bigNumberStrings: true,
          },
          pool: {
            max: 10,
            min: 0,
          },
        },
      },
    },
  };
  