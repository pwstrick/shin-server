/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-03-23 18:06:44
 * @LastEditTime: 2021-09-06 12:19:23
 * @Description: 性能数据统计
 * @FilePath: /strick/shin-server/models/WebPerformanceStatis.js
 */
module.exports = ({ mysql }) =>
  mysql.backend.define(
    "WebPerformanceStatis",
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
      project: {
        type: Sequelize.TEXT,
        field: "project"
      },
    },
    {
      tableName: "web_performance_statis",
      timestamps: false
    }
  );