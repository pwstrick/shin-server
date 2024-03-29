/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-02-25 15:32:43
 * @LastEditTime: 2023-04-24 18:01:39
 * @Description: 前端监控
 * @FilePath: /strick/shin-server/services/webMonitor.js
 */
import config from "config";
import models from '../models';
import redis from '../db/redis';
import xfetch from '../utils/xfetch';
const tokenRedis = 'tenant:access:token';
class WebMonitor {
  /**
   * 初始化数据
   */
  initMonitorWhere({id, category, msg, project, start, 
    end, identity, other, messageType, messageStatus, messagePath}) {
    let where = {
      ...other
    };
    if (id) {
      where.id = id;
    }
    if (category) {
      where.category = category;
    }
    if (identity) {
      where.identity = identity;
    }
    if (project) {
      where.project = project;
    }
    if (messageType) {
      where.message_type = messageType;
    }
    if (messageStatus) {
      where.message_status = messageStatus;
    }
    if (messagePath) {
      where.message_path = messagePath;
    }
    if (start && end) {
      where.ctime = {
        $gte: start,
        $lte: end,
      };
    }
    if (msg && msg.length > 0) {
      const messages = msg.map(value => ({
        message: {
          $like: `%${value}%`,
        }
      }));
      where = Sequelize.and(where, ...messages);
    }
    return where;
  }
  /**
  * 查询日志
  */
  async getMonitorList({  curPage, pageSize, id, category, msg, 
    project, start, end, identity, other={}, match, messageType, messageStatus, messagePath }) {
    const where = this.initMonitorWhere({ id, category, msg, 
      project, start, end, identity, other, match, messageType, messageStatus, messagePath });
    return models.WebMonitor.findAndCountAll({
      where,
      order: [['id', 'DESC']],
      raw: true,
      limit: parseInt(pageSize),
      offset: (curPage - 1) * pageSize,
    });
  }


  /**
  * 统计异常通信
  */
  async countErrorAjax({  project, day, messageStatus }) {
    const where = {
      project, 
      day,
      message_status: messageStatus
    }
    const field = "message_path";
    return models.WebMonitor.count({
      where,
      group: [ field ],
      attributes: [ field ]
    });
  }

  /**
  * 查询日志图表生成
  */
  async getMonitorListChart({ id, category, msg, project, start, end, 
    identity, other={}, match, day, hour, attribute, messageType, messageStatus, messagePath }) {
    const where = this.initMonitorWhere({ id, category, msg, project, start, end, 
      identity, other, match, messageType, messageStatus, messagePath });
    if(day) {
      where.day = day;
    }
    if(hour !== undefined) {
      where.hour = hour;
    }
    const field = attribute;
    return models.WebMonitor.count({
      where,
      group: [ attribute ],
      attributes: [ attribute ],
      having: { [field]: {
        $ne: null
      }}
    });
  }
  /**
  * 查询指定日志的上下文
  */
  async getMonitorContext({ from, to }) {
    const where = {
      id: {
        $gte: from,
        $lte: to,
      }
    };
    return models.WebMonitor.findAll({
      where,
      raw: true,
    });
  }
  /**
   * 删除过期日志
   */
  async delExpiredMonitor({ deadline }) {
    const where = {
      ctime: {
        $lte: deadline ,
      }
    };
    return models.WebMonitor.destroy({
      where,
    });
  }
  /**
   * 删除过期的map文件
   */
  async delExpiredMap({ day }) {
    return xfetch({
      url: '/smap/del',
      method: 'GET',
      params: { day },
      baseURL: config.get('services').adminApi,
    });
  }
  /**
  * 统计数量
  */
  async statisticCount({ project, category, from, to, other={} }) {
    const where = {
      ...other
    };
    if(project) {
      where.project = project;
    }
    if(category) {
      where.category = category;
    }
    where.ctime =  {
      $gte: from,
      $lt: to,
    };
    const count = await models.WebMonitor.count({
      where,
    });
    return count ? count : 0;
  }
  /**
  * 统计总量
  */
  async statisticSum({ field, project, category, from, to }) {
    const where = {
      ctime: {
        $gte: from,
        $lte: to,
      }
    };
    if(project) {
      where.project = project;
    }
    if(category) {
      where.category = category;
    }
    const sum = await models.WebMonitor.sum(field, {
      where
    });
    return sum ? sum : 0;
  }
  /**
  * 添加一条统计记录
  */
  async createStatis(data) {
    return models.WebMonitorStatis.create(data);
  }
  /**
  * 读取一条统计记录
  */
  async getOneStatis(where) {
    return models.WebMonitorStatis.findOne({
      where,
      raw: true
    });
  }
  /**
  * 读取多条统计记录
  */
  async getStatisList({ start, end, other={} }) {
    const where = {
      ...other
    };
    if (start && end) {
      where.date = {
        $gte: start,
        $lte: end,
      };
    }
    return models.WebMonitorStatis.findAll({
      where,
      raw: true,
    });
  }
  /**
   * 创建性能监控项目
   */
  async createPerformanceProject(data) {
    return models.WebPerformanceProject.create(data);
  }
  /**
   * 获取一条性能监控项目
   */
  async getOnePerformanceProject(where) {
    return models.WebPerformanceProject.findOne({
      where,
      raw: true
    });
  }
  /**
   * 获取正常的性能监控项目
   */
   async getPerformanceProjectList({ name, curPage, pageSize }) {
    const where = {
      status: 1,
    };
    if(name) {
      where.name = {
        $like: `%${name}%`
      }
    }
    return models.WebPerformanceProject.findAndCountAll({
      where,
      raw: true,
      order: 'ctime DESC',
      limit: parseInt(pageSize),
      offset: (curPage - 1) * pageSize,
    });
  }
  /**
   * 更新性能监控项目
   */
  async updatePerformanceProject(id, data) {
    return models.WebPerformanceProject.update(
      data,
      {
        where: { id },
      }
    );
  }
  /**
   * 删除性能监控项目
   */
  async delPerformanceProject({ id }) {
    return models.WebPerformanceProject.update(
      { status: 0 },
      {
        where: { id }
      }
    );
  }
  /**
  * 统计数量
  */
  async statisticPerformanceCount({ project, day, hour, other={}, group, attributes }) {
    const where = {
      ...other
    };
    if(project) {
      where.project = project;
    }
    if(day) {
      where.day = day;
    }
    if(hour !== undefined) {
      where.hour = hour;
    }
    const count = await models.WebPerformance.count({
      attributes,
      where,
      group
    });
    return count ? count : 0;
  }
  /**
   * 获取一条性能数据
   */
  async getOnePerformance(where) {
    return models.WebPerformance.findOne({
      where,
      raw: true,
    });
  }
  /**
   * 获取一条性能数据
   */
  async getPerformanceFlow({
    id, type, range, identity, curPage, pageSize, start, end, path
  }) {
    const where = {};
    const types = {
      1: 'paint',
      2: 'screen',
    };
    const ranges = {
      1: {
        $lte: 1000,
      },
      2: {
        $gt: 1000,
        $lte: 2000,
      },
      3: {
        $gt: 2000,
        $lte: 3000,
      },
      4: {
        $gt: 3000,
        $lte: 4000,
      },
      5: {
        $gt: 4000,
      },
    };
    if(identity) where.identity = identity;
    if (id) where.id = id;
    if (type && range) {
      where[types[type]] = ranges[range];
    }
    if (start && end) {
      where.ctime = {
        $gte: start,
        $lte: end,
      };
    }
    if(path) where.referer_path = path;
    return models.WebPerformance.findAndCountAll({
      where,
      raw: true,
      order: 'ctime DESC',
      limit: parseInt(pageSize),
      offset: (curPage - 1) * pageSize,
    });
  }
  /**
   * 获取一条排序处在95%位置的性能数据
   */
  async getOneOrderPerformance(where, order, offset) {
    return models.WebPerformance.findOne({
      where,
      order,
      offset,
      raw: true
    });
  }
  /**
   * 获取多条性能数据
   */
  async getPerformanceListByIds(ids) {
    const where = {
      id: ids
    };
    return models.WebPerformance.findAll({
      where,
      raw: true
    });
  }
  /**
   * 创建性能统计项目
   */
  async createPerformanceStatis(data) {
    return models.WebPerformanceStatis.create(data);
  }
  /**
  * 读取一条性能统计记录
  */
  async getOnePerformanceStatis(where) {
    return models.WebPerformanceStatis.findOne({
      where,
      raw: true
    });
  }
  /**
   * 删除过期性能日志
   */
  async delExpiredPerformance({ deadline }) {
    const where = {
      day: {
        $lte: deadline ,
      }
    };
    return models.WebPerformance.destroy({
      where,
    });
  }
  /**
   * 删除过期性能统计日志
   */
  async delExpiredPerformanceStatis({ deadline }) {
    const where = {
      date: {
        $lte: deadline ,
      }
    };
    return models.WebPerformanceStatis.destroy({
      where,
    });
  }
  /**
   * 获取飞书的token
   * https://open.feishu.cn/document/ukTMukTMukTM/uIjNz4iM2MjLyYzM
   */
  async getTenantAccessToken() {
    // 读取缓存中的token，缓存有效时间为 2 小时
    let token = await redis.single.get(tokenRedis);
    if(token) {
      return `Bearer ${token}`;
    }
    // 调用飞书接口
    const { data } = await xfetch({
      baseURL: config.get("feishu").url,
      url: "open-apis/auth/v3/tenant_access_token/internal",
      data: { 
        app_id: config.get("feishu").app_id,
        app_secret: config.get("feishu").app_secret,
      },
      method: 'POST',
    });
    token = data.tenant_access_token;
    // 超时时间为 2 小时
    await redis.single.set(tokenRedis, token, 'EX', data.expire);
    return `Bearer ${token}`;
  }

  /**
   * 飞书发送消息
   * https://open.feishu.cn/document/ukTMukTMukTM/uUjNz4SN2MjL1YzM?lang=zh-CN
   */
  async tenantSend({ email, text }) {
    const token = await this.getTenantAccessToken();
    return xfetch({
      headers: {
        Authorization: token
      },
      baseURL: config.get("feishu").url,
      url: "open-apis/message/v4/send/",
      data: { 
        email,
        msg_type: "text",
        content: {
          text
        }
      },
      method: 'POST',
    });
  }

  /**
   * 创建性能日志
   */
  async createPerformance(data) {
    return models.WebPerformance.create(data);
  }

  /**
   * 处理日志的更新和新增
   */
  async handleMonitor(monitor) {
    const exist = await this.getMonitorByKey(monitor);    //是否存在监控日志
    // 存在
    if(exist) 
      return this.updateMonitorDigit(exist.digit+1, exist.id);   //更新出现次数
    let row = await this.createMonitor(monitor);      //创建记录
    row = row.toJSON();
    // 添加行为记录
    if (monitor.record) {
      await models.WebMonitorRecord.create({ monitor_id: row.id, record: monitor.record });
    }
    return row;
  }

  /**
   * 根据 Key 来搜索日志
   */
  async getMonitorByKey({ project, category, key, identity }) {
    return models.WebMonitor.findOne({
      raw: true,
      where: {
        project, 
        category, 
        key,
        identity
      }
    });
  }

  /**
   * 创建监控日志
   */
  async createMonitor(data) {
    return models.WebMonitor.create(data);
  }

  /**
   * 更新监控日志的出现次数
   */
  async updateMonitorDigit(digit, id) {
    return models.WebMonitor.update({
        digit
      }, {
      where: { id }
    });
  }
}
export default WebMonitor;
