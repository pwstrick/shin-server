import requireIndex from 'es6-requireindex';
import models from '../models/';

const services = {};
const dir = requireIndex(__dirname);
Object.keys(dir).forEach((item) => {
  services[item] = new dir[item](models);
});

export default services;

