import requireIndex from 'es6-requireindex';

const middleswares = {};
const dir = requireIndex(__dirname);
Object.keys(dir).forEach((item) => {
  middleswares[item] = dir[item];
});

export default middleswares;
