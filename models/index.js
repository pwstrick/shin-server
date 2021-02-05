import requireIndex from 'es6-requireindex';
import mysql from '../db/mysql';
import mongodb from '../db/mongodb';
import redis from '../db/redis';

const models = {};
const dir = requireIndex(__dirname);
Object.keys(dir).forEach((item) => {
  models[item] = dir[item]({ mysql, mongodb, redis });
  models[item].live = mysql.live;
  models[item].fm = mysql.fm;
});

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});
export default models;

