/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2020-12-16 19:17:57
 * @LastEditTime: 2023-04-24 18:01:29
 * @Description: 后台工具服务
 * @FilePath: /strick/shin-server/services/tool.js
 */
import redis from '../db/redis';
const shortChainKey = 'cache:aws:shortChain';
import models from '../models';

class Tool {
  /**
   * MongoDB查询
   */
  async mongoQuery({ name, options, cursor }) {
    let result = models[name].find(options);
    for (let key in cursor) {
      if (cursor[key] !== undefined) {
        result[key](cursor[key]);
        continue;
      }
      result[key]();
    }
    return result.exec();
  }

  /**
   * 创建通用配置
   */
  async createConfig({ title, content, key }) {
    return models.AppGlobalConfig.create({ title, content, key });
  }
  /**
   * 编辑通用配置
   */
  async editConfig({ title, content, id }) {
    return models.AppGlobalConfig.update(
      { title, content },
      {
        where: {
          id
        }
      }
    );
  }
  /**
   * 删除通用配置
   */
  async delConfig({ id }) {
    return models.AppGlobalConfig.update(
      { status: 0 },
      {
        where: {
          id
        }
      }
    );
  }
  /**
   * 通用配置列表
   */
  async getConfigList() {
    return models.AppGlobalConfig.findAndCountAll({
      where: {
        status: 1
      }
    });
  }
  /**
   * 读取一条通用配置
   */
  async getOneConfig(where) {
    return models.AppGlobalConfig.findOne({
      where,
      raw: true
    });
  }
  /**
   * 读取通用配置解析后的内容
   */
  async getConfigContent(where) {
    const result = await models.AppGlobalConfig.findOne({
      where,
      raw: true
    });
    if (!result) {
      return result;
    }
    const { content } = result;
    return JSON.parse(content);
  }
  /**
   * 添加短链
   */
  async createShortChain(data) {
    const result = models.WebShortChain.create(data);
    if(result) {
      this.redisShortChainSet(data.short, data.url);
    }
    return result;
  }
  /**
   * 更新短链
   */
  async updateShortChain(data) {
    //更新的返回值是一个数组，包含受影响的函数
    const [affected] = await models.WebShortChain.update({
      url: data.url
    }, {
      where: {
        id: data.id,
      },
    });
    if(affected > 0) {
      this.redisShortChainSet(data.short, data.url);
    }
    return affected;
  }
  /**
   * 查询短链的一条记录
   */
  async getOneShortChain(where) {
    return models.WebShortChain.findOne({
      where,
      raw: true   //格式化返回值，只包含表的字段
    });
  }
  /**
   * 查询短链列表
   */
  async getShortChainList({ curPage, short, url }) {
    const where = {
      status: 1
    };
    if(short) {
      where.short = {
        $like: `%${short}%`,
      };
    }
    if(url) {
      where.url = {
        $like: `%${url}%`,
      };
    }
    return models.WebShortChain.findAndCountAll({
      where,
      limit: 20,
      offset: (curPage - 1) * 20,
      order: [['ctime', 'desc']],
    });
  }
  /**
   * 删除短链
   * 若有删除，就需要有恢复的操作，否则就得物理删除
   * 因为 key 是唯一的，不允许重复
   */
  async delShortChain({ id, short }) {
    const [affected] = await models.WebShortChain.update({
      status: 0
    }, {
      where: {
        id: id,
      },
    });
    if(affected == 0)
      return 0;
    //删除缓存
    this.redisShortChainDel(short);
    return 1;
  }
  /**
   * 更新短链缓存
   * 默认存7天
   */
  async redisShortChainSet(key, url) {
    const result = redis.aws.hset(shortChainKey, key, url);
    redis.aws.expire(shortChainKey, 604800);   //超时时间为7天
    return result;
  }
  //读取redis
  async redisShortChainGet(key) {
    return redis.aws.hget(shortChainKey, key);
  }
  //删除redis
  async redisShortChainDel(key) {
    return redis.aws.hdel(shortChainKey, key);
  }
}
export default Tool;
  