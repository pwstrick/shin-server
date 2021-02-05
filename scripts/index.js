/*
 * @Author: strick
 * @Date: 2021-02-03 14:06:38
 * @LastEditTime: 2021-02-03 15:06:39
 * @LastEditors: strick
 * @Description: 脚本入口
 * @FilePath: /strick/shin-server/scripts/index.js
 */
require('babel-core/register');
require('babel-polyfill');

global.env = process.env.NODE_ENV;
global.logger = {
  trace: console.log,
  info: console.log,
  debug: console.log,
  error: console.log,
  warn: console.log,
};

/**
 * 执行命令，当前位置如果与 scripts 目录平级，则 NODE_ENV=development node scripts/index.js
 * 其中 NODE_ENV 为环境常量，test、pre 和 production
 */
require('./demo');


