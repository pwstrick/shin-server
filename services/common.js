/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-07-21 15:47:03
 * @LastEditTime: 2021-07-21 15:49:21
 * @Description: 通用数据处理
 * @FilePath: /strick/shin-server/services/common.js
 */
class Common {
  constructor(models) {
    this.models = models;
  }

  /**
   * 数据库查询一条记录
   */
  async getOne(tableName, where = {}) {
    return this.models[tableName].findOne({
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
    return this.models[tableName].findAndCountAll({
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
      return this.models[tableName][func]({
        where
      });
    return this.models[tableName][func](field, {
      where
    });
  }

  /**
   * 新增
   */
  async create(tableName, data) {
    return this.models[tableName].create(data);
  }

  /**
   * 修改
   */
  async update(tableName, set, where) {
    return this.models[tableName].update(set, { where });
  }
}
export default Common;