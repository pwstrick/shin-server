import requireIndex from 'es6-requireindex';

export default (router) => {
  const dir = requireIndex(__dirname);
  Object.keys(dir).forEach((item) => {
    dir[item](router);
  });
};