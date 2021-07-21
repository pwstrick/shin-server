/*
 * @Author: strick
 * @Date: 2021-02-03 15:15:01
 * @LastEditTime: 2021-07-21 15:50:51
 * @LastEditors: strick
 * @Description: 通用路由
 * @FilePath: /strick/shin-server/routers/common.js
 */
import _ from "lodash";
const fs = require('fs');
const path = require('path');
export default (router, services, middlewares) => {
  /**
   * 上传逻辑
   */
  async function upload(ctx) {
    const { files, body } = ctx.request;
    const { dir } = body;         //上传的目录
    const { file } = files;
    const stringLib = 'abcdefghijklmnopqrstuvwxyz';
    const randomString = _.sampleSize(stringLib, 6);
    const ext = file.name.split('.').pop();
    // 文件的上传目录
    let upDir = "upload";
    if(dir) {
      upDir = `upload/${dir}`;
    }
    // 文件的上传路径
    let filePath = `${upDir}/${Date.now()}${randomString.join('')}.${ext}`;
    // 创建目录
    const absdir = path.join(__dirname, `../static/${upDir}`),
      absFilePath = path.join(__dirname, `../static/${filePath}`);
    return new Promise( resolve => {
      // 创建可读流
      const reader = fs.createReadStream(file.path);
      fs.mkdirSync(absdir, { recursive: true });
      // 创建可写流
      const upStream = fs.createWriteStream(absFilePath);
      // 可读流通过管道写入可写流
      reader.pipe(upStream);
      reader.on('end', () => {
        resolve(filePath);
      });
    });
  }
  /**
   * 文件上传
   */
  router.post(
    "/common/upload",
    async (ctx) => {
      // 内部走的是异步逻辑，用Promise来实现同步
      const filePath = await upload(ctx);
      ctx.body = { code: 0, key: filePath };
    }
  );

  /**
   * 会员详情
   */
  router.get(
    "/appuser/detail",
    async (ctx) => {
      const { type, id } = ctx.query;
      ctx.body = { code: 0 };
    }
  );
  
  /**
   * 读取表名，查询条件或字段
   */
  function getTableAndWhere(body) {
    if(Object.keys(body).length == 0) {
      return { tableName: null };
    }
    const tableName = Object.keys(body)[0];   //表名
    const where = body[tableName];    //查询条件
    return { tableName, where };
  }

  /**
   * 验证表名
   */
  function validateTableName(ctx, tableName) {
    if(!tableName || tableName == 'undefined') {
      ctx.body = { code: 1, msg: '请传输表名' };
      return false;
    }
    return true;
  }
  /**
   * 读取一条记录
   * { 
   *    TableName : { 查询条件 }
   * }
   * TableName是Model文件的名称，并非数据库表名
   */
  router.post('/get',
  async (ctx) => {
    const { body } = ctx.request;
    const { tableName, where } = getTableAndWhere(body);
    if(!validateTableName(ctx, tableName)) {
      return;
    }
    // 将表名和查询条件传递给数据库方法
    const data = await services.common.getOne(tableName, where);
    ctx.body = { code: 0, data };
  });

  /**
   * 读取多条记录
   * { 
   *    TableName : { 查询条件 },
   *    limit, order, curPage
   * }
   */
  router.post('/gets',
   async (ctx) => {
    const { body } = ctx.request;
    // 分页，排序，页数
    let { limit, order, curPage } = body;
    delete body.limit;
    delete body.order;
    delete body.curPage;
    limit = limit && (+limit);
    const { tableName, where } = getTableAndWhere(body);
    if(!validateTableName(ctx, tableName)) {
      return;
    }
    const { count, rows } = await services.common.getList({ 
      tableName,
      where,
      limit, 
      order, 
      curPage,
    });
    ctx.body = { code: 0, data: rows, count };
  });

  /**
   * 聚合数据
   * 例如count，max，min 和 sum
   * {
   *    TableName : { 查询条件 },
   *    aggregation   聚合函数
   *    field         聚合字段（除了count之外，都必传）
   * }
   */
  router.post('/head',
   async (ctx) => {
    const { body } = ctx.request;
    // 聚合动作
    const { aggregation, field } = body;
    delete body.aggregation;
    delete body.field;
    const { tableName, where } = getTableAndWhere(body);
    if(!validateTableName(ctx, tableName)) {
      return;
    }
    if(aggregation != "count" && !field) {
      ctx.body = { code: 1, msg: '请传输聚合字段' };
      return;
    }
    const data = await services.common.aggregation({ tableName, where, func: aggregation, field });
    ctx.body = { code: 0, data };
  });

  /**
   * 新增
   * {
   *    TableName : { 新增的字段 }
   * }
   */
  router.post('/post',
   async (ctx) => {
    const { body } = ctx.request;
    const { tableName, where } = getTableAndWhere(body);
    if(!validateTableName(ctx, tableName)) {
      return;
    }
    if(Object.keys(where).length === 0) {
      ctx.body = { code: 1, msg: '请传输新增字段' };
      return;
    }
    const data = await services.common.create(tableName, where);
    ctx.body = { code: 0, data };
  });

  /**
   * 修改
   * {
   *    TableName : { 查询条件 }
   *    set : { 更新的字段 }
   * }
   */
  router.post('/put',
   async (ctx) => {
    const { body } = ctx.request;
    // 字段更新
    const { set } = body;
    delete body.set;
    if(!set) {
      ctx.body = { code: 1, msg: '请传输更新字段' };
      return;
    }
    if(Object.keys(set).length === 0) {
      ctx.body = { code: 1, msg: '请传输更新字段' };
      return;
    }
    const { tableName, where } = getTableAndWhere(body);
    if(!validateTableName(ctx, tableName)) {
      return;
    }
    const affected = await services.common.update(tableName, set, where);
    ctx.body = { code: (affected > 0 ? 0 : 1) };
  });
}