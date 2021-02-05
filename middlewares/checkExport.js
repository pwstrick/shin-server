import config from 'config';
import jwt from 'jsonwebtoken';

export default () => async (ctx, next) => {
  const { token } = ctx.query;
  try {
    jwt.verify(token, config.get('jwtSecret'));
    await next();
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error };
  }
};
