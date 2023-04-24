/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-07-21 15:47:03
 * @LastEditTime: 2023-04-24 18:01:08
 * @Description: 通用数据处理
 * @FilePath: /strick/shin-server/services/common.js
 */
import models from '../models';
class Common {
  /**
   * 数据库查询一条记录
   */
  async getOne(tableName, where = {}) {
    return models[tableName].findOne({
      where,
      raw: true
    });
  }

  /**
   * 数据库查询多条记录
   * 默认提供页码、页数和排序规则
   */
  async getList({
    tableName,
    where = {},
    curPage = 1,
    limit = 20,
    order = [["id", "DESC"]]
  }) {
    return models[tableName].findAndCountAll({
      where,
      limit,
      offset: (curPage - 1) * limit,
      order,
      raw: true
    });
  }

  /**
   * 聚合
   */
  async aggregation({ tableName, where = {}, func = "count", field }) {
    if (func === "count")
      return models[tableName][func]({
        where
      });
    return models[tableName][func](field, {
      where
    });
  }

  /**
   * 新增
   */
  async create(tableName, data) {
    return models[tableName].create(data);
  }

  /**
   * 修改
   */
  async update(tableName, set, where) {
    return models[tableName].update(set, { where });
  }
}
export default Common;