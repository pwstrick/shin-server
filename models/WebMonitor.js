/*
 * @Author: strick
 * @Date: 2021-02-24 16:17:40
 * @LastEditTime: 2023-05-08 17:20:55
 * @LastEditors: strick
 * @Description: 前端监控日志表
 * @FilePath: /strick/shin-server/models/WebMonitor.js
 */
module.exports = ({ mysql }) =>
  mysql.backend.define(
    "WebMonitor",
    {
      id: {
        type: Sequelize.BIGINT,
        field: "id",
        autoIncrement: true,
        primaryKey: true
      },
      project: {
        type: Sequelize.STRING,
        field: "project"
      },
      project_subdir: {
        type: Sequelize.STRING,
        field: "project_subdir"
      },
      digit: {
        type: Sequelize.INTEGER,
        field: "digit"
      },
      message: {
        type: Sequelize.TEXT,
        field: "message"
      },
      key: {
        type: Sequelize.STRING,
        field: "key"
      },
      ua: {
        type: Sequelize.STRING(600),
        field: "ua"
      },
      source: {
        type: Sequelize.STRING,
        field: "source"
      },
      category: {
        type: Sequelize.STRING,
        field: "category"
      },
      ctime: {
        type: Sequelize.DATE,
        field: "ctime"
      },
      identity: {
        type: Sequelize.STRING,
        field: "identity"
      },
      day: {
        type: Sequelize.INTEGER,
        field: "day"
      },
      hour: {
        type: Sequelize.INTEGER,
        field: "hour"
      },
      minute: {
        type: Sequelize.INTEGER,
        field: "minute"
      },
      message_status: {
        type: Sequelize.INTEGER,
        field: "message_status"
      },
      message_path: {
        type: Sequelize.STRING,
        field: "message_path"
      },
      message_type: {
        type: Sequelize.STRING,
        field: "message_type"
      },
      referer: {
        type: Sequelize.STRING,
        field: 'referer',
      },
    },
    {
      tableName: "web_monitor",
      timestamps: false
    }
  );

