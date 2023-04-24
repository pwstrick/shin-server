import redis from '../db/redis';
const KEY_LOGIN_COUNT = 'backend:login:count';
import models from '../models';

/**
 * 管理后台用户账号
 */
class BackendUserAccount {
  /**
   * 注册
   */
  async register(...data) {
    const entity = new models.BackendUserAccount(data[0]);
    const res = await entity.save();
    return res;
  }

  /**
   * 通过id查询用户
   */
  async getInfoById(id) {
    try {
      const res = await models.BackendUserAccount.findOne({ _id: id });
      return res;
    } catch (err) {
      logger.error(err.message);
      return '';
    }
  }

  /**
   * 通过用户名查询账号信息
   */
  async getInfoByUserName(userName) {
    const res = await models.BackendUserAccount.findOne({ userName });
    return res;
  }

  /**
   * 更新账号信息
   */
  async updateInfo(id, data) {
    const res = await models.BackendUserAccount.update({
      _id: id,
    }, {
      $set: data,
      updateTime: new Date(),
    });
    return res;
  }

  /**
   * 获取用户列表
   */
  async getList(curPage, limit, keywords, roleId) {
    const whereCondition = {
      status: {
        $lt: 2,
      },
    };
    if (keywords) {
      whereCondition.$or = [
        {
          realName: new RegExp(keywords),
        },
        {
          userName: new RegExp(keywords),
        },
      ];
    }
    if (roleId && roleId !== 'all') {
      whereCondition.roles = {
        $in: [roleId],
      };
    }
    const list = await models.BackendUserAccount.find(
      whereCondition
    , {
      password: 0,
      salt: 0,
    }).skip((curPage - 1) * limit).limit(limit).sort({ createTime: 'desc' });
    const count = await models.BackendUserAccount
    .find(whereCondition, {
        password: 0,
        salt: 0,
    })
    .count();
    return {list, count};
  }

  /**
   * 查询指定用户详情
   */
  async getDetail(userId) {
    const res = await models.BackendUserAccount.findOne({
      _id: userId,
    })
    return res;
  }

  /**
   * 检查邮箱是否已被注册
   */
  async checkEmailExist(email) {
    const res = await models.BackendUserAccount.findOne({
      userName: email,
    });
    return res;
  }

  /**
   * 检查手机号是否已注册
   */
  async checkCelphoneExist(cellphone) {
    const res = await models.BackendUserAccount.findOne({
      cellphone,
    });
    return res;
  }

  /**
   * 更新用户状态
   */
  async updateStatus(_id, status) {
    const res = await models.BackendUserAccount.update({
      _id,
    }, {
      $set: {
        status,
      },
      updateTime: new Date(),
    });
    return res;
  }

  /**
   * 删除用户
   */
  async delete(_id) {
    const res = await models.BackendUserAccount.remove({
      _id,
    });
    return res;
  }

  /**
   * 查询所有账号
   */
  async find() {
    const res = await models.BackendUserAccount.find();
    return res;
  }

  /**
   * 读取缓存中的登录次数
   */
  async getLoginCount(userName) {
    const res = await redis.aws.get(`${KEY_LOGIN_COUNT}:${userName}`);
    return res;
  }

  /**
   * 增加缓存中的登录次数
   */
  async increaseLoginCount(userName) {
    const res = await redis.aws.incr(`${KEY_LOGIN_COUNT}:${userName}`);
    return res;
  }

  /**
   * 写入缓存中的登录次数
   */
  async setLoginCount(userName) {
    const res = await redis.aws.set(`${KEY_LOGIN_COUNT}:${userName}`, 0, 'EX', 300);
    return res;
  }
  
  /**
   * 移除缓存中的登录次数
   */
  async resetLoginCount(userName) {
    const res = await redis.aws.del(`${KEY_LOGIN_COUNT}:${userName}`);
    return res;
  }

  /**
   * 根据真实姓名查询账户
   */
  async getAccountOfName(realName) {
    return models.BackendUserAccount.findOne({
      realName,
    });
  }

  /**
   * 查询指定角色id的账号
   */
  async getListOfRole(id) {
    return models.BackendUserAccount.find({
      roles: id.toString(),
    });
  }
}

export default BackendUserAccount;
