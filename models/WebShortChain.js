/*
 * @Author: strick
 * @Date: 2021-01-19 10:01:09
 * @LastEditTime: 2021-02-05 13:42:30
 * @LastEditors: strick
 * @Description: 短链存储
 * @FilePath: /strick/shin-server/models/WebShortChain.js
 */
module.exports = ({ mysql }) =>
  mysql.backend.define("WebShortChain",
    {
      id: {
        type: Sequelize.INTEGER,
        field: "id",
        autoIncrement: true,
        primaryKey: true
      },
      // 短链中的6个字符
      short: {
        type: Sequelize.STRING,
        field: "short"
      },
      // 原始地址
      url: {
        type: Sequelize.STRING,
        field: "url"
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
      tableName: "web_short_chain",
      timestamps: false
    }
);

