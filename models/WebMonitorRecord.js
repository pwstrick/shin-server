/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2022-12-21 17:15:12
 * @LastEditTime: 2022-12-21 17:15:18
 * @Description: 行为记录表
 * @FilePath: /strick/shin-server/models/WebMonitorRecord.js
 */
module.exports = ({ mysql }) => mysql.backend.define(
    'WebMonitorRecord',
    {
      monitor_id: Sequelize.BIGINT,
      record: Sequelize.TEXT('medium'),
      ctime: {
        type: Sequelize.DATE,
        field: 'ctime',
      },
    },
    {
      tableName: 'web_monitor_record',
      timestamps: false,
    },
  );