/*
 * @Author: strick
 * @Date: 2021-02-02 16:10:13
 * @LastEditTime: 2021-02-02 16:13:08
 * @LastEditors: strick
 * @Description: 入口文件
 * @FilePath: /strick/shin-server/index.js
 */
require('babel-core/register');
require('babel-polyfill');

global.env = process.env.NODE_ENV || 'development';

require('./app.js');