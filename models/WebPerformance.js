/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-03-23 11:48:52
 * @LastEditTime: 2022-07-12 16:29:05
 * @Description: 性能监控日志
 * @FilePath: /strick/shin-server/models/WebPerformance.js
 */
module.exports = ({ mysql }) =>
  mysql.backend.define(
    "WebPerformance",
    {
      id: {
        type: Sequelize.BIGINT,
        field: 'id',
        autoIncrement: true,
        primaryKey: true,
      },
      load: {
        type: Sequelize.INTEGER,
        field: 'load',
      },
      ready: {
        type: Sequelize.INTEGER,
        field: 'ready',
      },
      paint: {
        type: Sequelize.INTEGER,
        field: 'paint',
      },
      screen: {
        type: Sequelize.INTEGER,
        field: 'screen',
      },
      ua: {
        type: Sequelize.STRING(600),
        field: 'ua',
      },
      measure: {
        type: Sequelize.STRING(1000),
        field: 'measure',
      },
      day: {
        type: Sequelize.INTEGER,
        field: 'day',
      },
      hour: {
        type: Sequelize.INTEGER,
        field: 'hour',
      },
      minute: {
        type: Sequelize.INTEGER,
        field: 'minute',
      },
      project: {
        type: Sequelize.STRING,
        field: 'project',
      },
      ctime: {
        type: Sequelize.DATE,
        field: 'ctime',
      },
      identity: {
        type: Sequelize.STRING,
        field: 'identity',
      },
      referer: {
        type: Sequelize.STRING,
        field: 'referer',
      },
      referer_path: {
        type: Sequelize.STRING,
        field: 'referer_path',
      },
      timing: {
        type: Sequelize.TEXT,
        field: 'timing',
      },
      resource: {
        type: Sequelize.TEXT,
        field: 'resource',
      },
    },
    {
      tableName: "web_performance",
      timestamps: false
    }
  );

