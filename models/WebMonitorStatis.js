/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-03-17 13:08:09
 * @LastEditTime: 2021-09-06 12:18:57
 * @Description: 监控统计
 * @FilePath: /strick/shin-server/models/WebMonitorStatis.js
 */
module.exports = ({ mysql }) =>
  mysql.backend.define(
    "WebMonitorStatis",
    {
      id: {
        type: Sequelize.INTEGER,
        field: "id",
        autoIncrement: true,
        primaryKey: true
      },
      date: {
        type: Sequelize.INTEGER,
        field: "date"
      },
      statis: {
        type: Sequelize.TEXT,
        field: "statis"
      },
    },
    {
      tableName: "web_monitor_statis",
      timestamps: false
    }
  );