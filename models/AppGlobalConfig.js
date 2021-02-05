/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2020-12-24 11:49:07
 * @LastEditTime: 2021-02-03 13:50:48
 * @Description: 全局通用配置
 * @FilePath: /strick/shin-server/models/AppGlobalConfig.js
 */
export default ({ mysql }) =>
  mysql.backend.define("AppGlobalConfig",
    {
      id: {
        type: Sequelize.INTEGER,
        field: "id",
        autoIncrement: true,
        primaryKey: true
      },
      // 标题
      title: {
        type: Sequelize.STRING,
        field: "title"
      },
      // 内容
      content: {
        type: Sequelize.STRING,
        field: "content"
      },
      // 唯一标识，用于读取
      key: {
        type: Sequelize.STRING,
        field: "key"
      },
      ctime: {
        type: Sequelize.DATE,
        field: "ctime"
      },
      mtime: {
        type: Sequelize.DATE,
        field: "mtime"
      },
      status: {
        type: Sequelize.INTEGER,
        field: "status"
      }
    },
    {
      tableName: "app_global_config",
      timestamps: false
    }
);
