/**
 * 管理后台用户
 * 用户的账号和角色管理
 */
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import moment from 'moment';
import config from 'config';
import { randomString } from '../utils';
import redis from '../db/redis';

//5分钟内登录次数超过此值账号将被禁用
const loginCountLimit = 3;

/**
 * 加密明文密码
 * @param {string} userName 用户名
 * @param {string} password 密码
 * @param {string} salt 加密秘钥，每个账户都不同
 */
const cryptoPassword = (userName, password, salt) => {
  const str = userName + password + salt;
  return crypto.createHash('md5').update(str).digest('hex');
};

export default (router, services, middlewares) => {
    // 查询当前用户信息
  router.get(
    '/user',
    async (ctx) => {
      const { realName } = ctx.state.user;
      ctx.body = {
        username: realName,
      };
    },
  );

  /**
   * 获取用户角色列表
   */
  router.get(
    '/user/role/list',
    middlewares.checkAuth('backend.user.role.list'),
    async (ctx) => {
      const data = ctx.query;
      const cursor = parseInt(data.cursor || 1);
      const limit = parseInt(data.limit || 10);
      const role = data.role;
      const res = await services.backendUserRole.getList(role, cursor, limit);
      ctx.body = {
        list: res.list,
        page: {
          cursor: Number(cursor),
          total: res.count,
        },
      };
    },
  );

  /**
   * 添加用户角色
   */
  router.post(
    '/user/role',
    middlewares.checkAuth('backend.user.role.list'),
    async (ctx) => {
      ctx.checkBody('roleName').notEmpty('角色名称不能为空');
      ctx.checkBody('roleDesc').notEmpty('角色描述不能为空');
      ctx.checkBody('rolePermission').notEmpty('角色权限不能为空');
      if (ctx.errors) {
        ctx.status = 400;
        ctx.body = { error: _.values(ctx.errors[0])[0] };
      } else {
        const { roleName, roleDesc, rolePermission } = ctx.request.body;
        const res = await services.backendUserRole.add(roleName, roleDesc, rolePermission);
        ctx.body = res;
      }
    },
  );

  /**
   * 修改用户角色信息
   */
  router.put(
    '/user/role',
    middlewares.checkAuth('backend.user.role.list'),
    async (ctx) => {
      ctx.checkBody('roleId').notEmpty('角色id不能为空');
      if (ctx.errors) {
        ctx.status = 400;
        ctx.body = { error: _.values(ctx.errors[0])[0] };
      } else {
        const data = ctx.request.body;
        const roleId = data.roleId;
        delete data.roleId;
        await services.backendUserRole.update(roleId, data);
        ctx.body = Object.assign({ roleId }, data);
      }
    },
  );

  /**
   * 禁用角色
   */
  router.post(
    '/user/role/disable',
    middlewares.checkAuth('backend.user.role.list'),
    async (ctx) => {
      ctx.checkBody('roleId').notEmpty('角色id不能为空');
      if (ctx.errors) {
        ctx.status = 400;
        ctx.body = { error: _.values(ctx.errors[0])[0] };
      } else {
        const { roleId } = ctx.request.body;
        await services.backendUserRole.update(roleId, { status: 0 });
        ctx.body = { roleId, status: 0 };
      }
    },
  );

  /**
   * 启用角色
   */
  router.post(
    '/user/role/enable',
    middlewares.checkAuth('backend.user.role.list'),
    async (ctx) => {
      ctx.checkBody('roleId').notEmpty('角色id不能为空');
      if (ctx.errors) {
        ctx.status = 400;
        ctx.body = { error: _.values(ctx.errors[0])[0] };
      } else {
        const { roleId } = ctx.request.body;
        await services.backendUserRole.update(roleId, { status: 1 });
        ctx.body = { roleId, status: 1 };
      }
    },
  );

  /**
   * 删除用户角色
   */
  router.del(
    '/user/role',
    middlewares.checkAuth('backend.user.role.list'),
    async (ctx) => {
      ctx.checkBody('roleId').notEmpty('角色id不能为空');
      if (ctx.errors) {
        ctx.status = 400;
        ctx.body = { error: _.values(ctx.errors[0])[0] };
        return;
      }
      const { roleId } = ctx.request.body;
      await services.backendUserRole.remove(roleId);
      ctx.body = { roleId };
    },
  );

  /**
   * 注册
   */
  router.post(
    '/user',
    async (ctx) => {
      ctx.checkBody('userName').isEmail('请填写正确的邮箱');
      ctx.checkBody('password').notEmpty('密码不能为空').len(6);
      ctx.checkBody('realName').notEmpty('真实姓名不能为空');
      ctx.checkBody('cellphone').isMobilePhone('请填写正确的手机号码', ['zh-CN']);
      ctx.checkBody('roles').notEmpty('用户角色不能为空');
      if (ctx.errors) {
        ctx.status = 400;
        ctx.body = { error: _.values(ctx.errors[0])[0] };
        return;
      }
      const { userName, password, realName, cellphone, roles } = ctx.request.body;
      // 检查邮箱是否已注册
      const emailCheck = await services.backendUserAccount.checkEmailExist(userName);
      if (emailCheck) {
        ctx.status = 400;
        ctx.body = { error: '邮箱已注册' };
        return;
      }
      // 检查手机是否已注册
      const cellphoneCheck = await services.backendUserAccount.checkCelphoneExist(cellphone);
      if (cellphoneCheck) {
        ctx.status = 400;
        ctx.body = { error: '手机号已注册' };
        return;
      }
      const data = ctx.request.body;
      const salt = randomString(32);
      data.salt = salt;
      data.password = cryptoPassword(userName, password, salt);
      const res = await services.backendUserAccount.register(data);
      ctx.body = {
        _id: res._id,
        userName,
        realName,
        status: 1,
        roles,
        cellphone,
      };
    },
  );

  /**
   * 登录
   */
  router.post(
    '/user/login',
    async (ctx) => {
      // 验证参数
      ctx.checkBody('__userName__').notEmpty('用户名不能为空');
      ctx.checkBody('__password__').notEmpty('密码不能为空');
      if (ctx.errors) {
        ctx.body = { code: 400, msg: ctx.errors };
        return;
      }

      // 获取用户信息
      const { __userName__, __password__ } = ctx.request.body;
      const userName = __userName__;
      const password = __password__;
      const res = await services.backendUserAccount.getInfoByUserName(userName);

      if (!res) {
        ctx.body = { code: 400, msg: '用户名不存在' };
        return;
      }

      if (res.status === 0) {
        ctx.body = { code: 400, msg: '您的账号已被禁用' };
        return;
      }

      // 检查登录计数
      const loginCount = await services.backendUserAccount.getLoginCount(userName);
      if (loginCount > loginCountLimit) {
        await services.backendUserAccount.updateStatus(res._id, 0);
        await services.backendUserAccount.resetLoginCount(userName);
        ctx.body = { code: 400, msg: '登陆错误次数超过限制，请联系管理员解封' };
        return;
      }
      if (loginCount === null) {
        await services.backendUserAccount.setLoginCount(userName);
      }
      // 登录计数 +1
      await services.backendUserAccount.increaseLoginCount(userName);

      // 验证密码
      const pwd = cryptoPassword(userName, password, res.salt);
      if (pwd === res.password) {
        // 获取当前账号的角色权限
        const promises = res.roles.map(item => services.backendUserRole.getInfoById(item));
        let roles = await Promise.all(promises);
        roles = _.filter(roles, role => role);
        // 检查角色状态
        let disabledPermissions = [];
        roles.forEach((role) => {
          if (role.status === 0) {
            disabledPermissions = disabledPermissions.concat(role.rolePermission);
          }
        });
        const authorities = _.chain(roles.map(item => item.rolePermission))
          .flatten(true)
          .filter(role => !disabledPermissions.includes(role))
          .uniq()
          .value();

        // 生成token
        const token = jwt.sign({
          id: res._id,
          // authorities,
          userName: res.userName,
          realName: res.realName,
        }, config.get('jwtSecret'), {
          expiresIn: '12h',
        });

        //测试环境 将token放到Redis中
        const nodeEnv = process.env.NODE_ENV;
        nodeEnv === "development" && (await redis.aws.set(`backend:user:account:token:development`, token));

        // 权限放入redis存储
        await redis.aws.set(`backend:user:account:authorities:${res._id}`, authorities.toString());
        
        // 密码过期时间通知
        let expireDays = 90;
        // const passwordExpireTime = res.passwordExpireTime;
        // if (passwordExpireTime) {
        //   if (moment().isBefore(moment(passwordExpireTime), 'd')) {
        //     const days = moment(passwordExpireTime).diff(moment(), 'd');
        //     expireDays = days > 0 ? days : 0;
        //   } else {
        //     ctx.body = { code: 400, msg: '密码过期' };
        //     return;
        //   }
        // } else {
        //   await services.backendUserAccount.updateInfo(res._id, { passwordExpireTime: moment().add(90, 'd').endOf('d') });
        // }
        ctx.body = { code:0, token, authorities, nodeEnv, expireDays };
      } else {
        ctx.body = { code: 400, msg: '密码错误' };
      }
    },
  );

  /**
   * 注销
   */
  router.post(
    '/user/logout',
    async (ctx) => {
      const { id, realName } = ctx.state.user;
      // 删除权限redis
      await redis.aws.del(`backend:user:account:authorities:${id}`);
      ctx.body = {
        code: 0,
      };
    },
  );

  /**
   * 获取用户列表
   * 通过角色id获取角色名称
   */
  router.get(
    '/user/list',
    middlewares.checkAuth('backend.user.account.list'),
    async (ctx) => {
      const data = ctx.query;
      const curPage = data.curPage || 1;
      const limit = data.limit || 10;
      const keywords = data.keywords;
      const roleId = data.roleId;
      const res = await services.backendUserAccount.getList(curPage, limit, keywords, roleId);
      ctx.body = {
        data: res.list,
        count: res.count,
      };
    },
  );

  /**
   * 查询指定用户详情
   */
  router.get(
    '/user/detail/:id',
    middlewares.checkAuth('backend.user.account.list'),
    async (ctx) => {
      const userId = ctx.params.id;
      const userData = await services.backendUserAccount.getDetail(userId);
      ctx.body = userData;
    },
  );

  /**
   * 更新用户信息
   * 不包括密码修改
   */
  router.put(
    '/user',
    middlewares.checkAuth('backend.user.account'),
    async (ctx) => {
      ctx.checkBody('id').notEmpty('用户id不能为空');
      ctx.checkBody('realName').notEmpty('真实姓名不能为空');
      ctx.checkBody('cellphone').isMobilePhone('请填写正确的手机号码', ['zh-CN']);
      ctx.checkBody('roles').notEmpty('用户角色不能为空');
      if (ctx.errors) {
        ctx.status = 400;
        ctx.body = { error: _.values(ctx.errors[0])[0] };
        return;
      }
      const data = ctx.request.body;
      const { id, userName, cellphone } = data;
      // 检查邮箱是否重复
      const emailCheck = await services.backendUserAccount.checkEmailExist(userName);
      if (emailCheck && (emailCheck._id.toString() !== id)) {
        ctx.status = 400;
        ctx.body = { error: '邮箱已注册' };
        return;
      }
      // 检查手机是否已注册
      const cellphoneCheck = await services.backendUserAccount.checkCelphoneExist(cellphone);
      if (cellphoneCheck && (cellphoneCheck._id.toString() !== id)) {
        ctx.status = 400;
        ctx.body = { error: '手机号已注册' };
        return;
      }
      delete data.id;
      await services.backendUserAccount.updateInfo(id, data);
      ctx.body = Object.assign({ id }, data);
    },
  );

  /**
   * 启用用户
   */
  router.post(
    '/user/enable',
    middlewares.checkAuth('backend.user.account'),
    async (ctx) => {
      ctx.checkBody('id').notEmpty('id不能为空');
      if (ctx.errors) {
        ctx.status = 400;
        ctx.body = { error: _.values(ctx.errors[0])[0] };
        return;
      }
      const id = ctx.request.body.id;
      await services.backendUserAccount.updateStatus(id, 1);
      ctx.body = {
        id,
        status: 1,
      };
    },
  );

  /**
   * 禁用用户
   */
  router.post(
    '/user/disable',
    middlewares.checkAuth('backend.user.account'),
    async (ctx) => {
      ctx.checkBody('id').notEmpty('id不能为空');
      if (ctx.errors) {
        ctx.status = 400;
        ctx.body = { error: _.values(ctx.errors[0])[0] };
        return;
      }
      const id = ctx.request.body.id;
      await services.backendUserAccount.updateStatus(id, 0);
      ctx.body = {
        id,
        status: 0,
      };
    },
  );

  /**
   * 修改密码
   */
  router.put(
    '/user/password',
    async (ctx) => {
      ctx.checkBody('password').notEmpty('密码不能为空');
      if (ctx.errors) {
        ctx.body = { code: 400, msg: _.values(ctx.errors[0])[0] };
        return;
      }
      const { password } = ctx.request.body;
      let { id, userName } = ctx.request.body;
      if (!id || !userName) {
        id = ctx.state.user.id;
        userName = ctx.state.user.userName;
      }
      // 增加密码是否重复判断
      const res = await services.backendUserAccount.getInfoByUserName(userName);
      if (!res) {
        ctx.body = { code: 400, msg: '用户名不存在' };
        return;
      }

      if (res.status === 0) {
        ctx.body = { code: 400, msg: '您的账号已被禁用' };
        return;
      }
      // 验证密码
      const pwdRes = cryptoPassword(userName, password, res.salt);
      if (pwdRes === res.password) {
        ctx.body = { code: 400, msg: '新密码与原密码相同' };
        return;
      }
      const salt = randomString(32);
      const pwd = cryptoPassword(userName, password, salt);
      // 修改密码后 有效期重置设置90天
      await services.backendUserAccount.updateInfo(id, { salt, password: pwd, passwordExpireTime: moment().add(90, 'd').endOf('d') });
      ctx.body = { code: 0 };
    },
  );

  /**
   * 删除用户
   */
  router.del(
    '/user',
    middlewares.checkAuth('backend.user.account'),
    async (ctx) => {
      ctx.checkBody('userId').notEmpty('id不能为空');
      if (ctx.errors) {
        ctx.status = 400;
        ctx.body = { error: _.values(ctx.errors[0])[0] };
        return;
      }
      const id = ctx.request.body.userId;
      await services.backendUserAccount.delete(id);
      ctx.body = {
        id,
      };
    },
  );

  /**
   * 初始化管理员用户
   */
  router.get(
    '/user/init',
    async (ctx) => {
      // 检查当前数据库状态
      const users = await services.backendUserAccount.find();
      if (users.length > 0) {
        ctx.status = 400;
        ctx.body = { error: '已经初始化过了', users };
        return;
      }
      // 创建管理员角色
      const roleName = '超级管理员';
      const roleDesc = '超级管理员';
      const rolePermission = '*';
      // console.log('创建管理员角色...');
      const res = await services.backendUserRole.add(roleName, roleDesc, rolePermission);
      const roleId = res._id.toString();
      // console.log(`创建管理员角色成功, roleId = ${roleId}`);
      // 创建管理员账号
      // console.log('创建管理员账号...');
      const initPassword = 'admin';         //可自定义密码
      const userName = 'admin@shin.com';    //可自定义初始化
      const salt = randomString(32);
      const createData = {
        userName,
        realName: '超级管理员',
        password: cryptoPassword(userName, initPassword, salt),
        salt,
        roles: [roleId],
      };
      await services.backendUserAccount.register(createData);
      // console.log(`创建管理员账号成功, accountId = ${account._id}`);
      ctx.body = `创建管理员账号成功, 请用 ${userName} : ${initPassword} 登录`;
    },
  );
};
