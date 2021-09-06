/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-03-22 14:23:36
 * @LastEditTime: 2021-09-06 12:19:18
 * @Description: 性能监控项目
 * @FilePath: /strick/shin-server/models/WebPerformanceProject.js
 */
module.exports = ({ mysql }) =>
  mysql.backend.define(
    "WebPerformanceProject",
    {
      id: {
        type: Sequelize.INTEGER,
        field: "id",
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        field: "name"
      },
      key: {
        type: Sequelize.STRING,
        field: "key"
      },
      status: {
        type: Sequelize.INTEGER,
        field: "status"
      },
      ctime: {
        type: Sequelize.DATE,
        field: "ctime"
      },
    },
    {
      tableName: "web_performance_project",
      timestamps: false
    }
  );
