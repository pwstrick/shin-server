/*
 * @Author: strick
 * @Date: 2021-02-03 14:17:34
 * @LastEditTime: 2021-02-03 14:28:36
 * @LastEditors: strick
 * @Description: 单元测试入口
 * @FilePath: /strick/shin-server/test/index.js
 */
import redis from '../db/redis';
import 'babel-polyfill';
/**
 * chai 4.0
 * https://www.chaijs.com/api/bdd/
 */
import { expect } from 'chai';
/**
 * supertest 3.0
 * https://github.com/visionmedia/supertest
 */
import supertest from 'supertest';
import models from '../models';

global.models = models;
global.expect = expect;
global.api = supertest('http://localhost:6060');
global.env = process.env.NODE_ENV || 'development';
global.logger = {
  info: function () {},
  warn: function () {},
  debug: function () {},
  trace: function () {},
  error: function () {},
  fatal: function () {}
};

//读取账户的登录态缓存
redis.aws.get("backend:user:account:token:development").then((token) => {
  global.authToken = `Bearer ${token}`;
});

  
