import requireIndex from 'es6-requireindex';
import services from '../services/';
import middlewares from '../middlewares';

export default (router) => {
  const dir = requireIndex(__dirname);
  Object.keys(dir).forEach((item) => {
    dir[item](router, services, middlewares);
  });
};
