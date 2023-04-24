/*
 * @Author: strick
 * @Date: 2021-02-03 15:15:01
 * @LastEditTime: 2023-04-24 17:46:33
 * @LastEditors: strick
 * @Description: 通用路由
 * @FilePath: /strick/shin-server/routers/common.js
 */
import _ from "lodash";
import config from 'config';
const fs = require('fs');
const path = require('path');
import crypto from 'crypto';
import moment from 'moment';
import queue from '../utils/queue';
import { MONITOR_PROJECT } from '../utils/constant';
import services from '../services/';


export default (router) => {
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

  /**
   * 提取路径中的地址
   */
  function extractPath(url) {
    /**
     * 只提取路径信息，去除协议、域名和端口
     * 加 {2,4} 是为了解决 https://// 无法匹配的问题
     */
    return url ? url.split('?')[0].replace(/(\w*):?\/{2,4}([^/:]+)(:\d*)?/, '').substring(1).trim() : null;
  }

  /**
   * 监控信息搜集
   */
   router.post('/ma.gif', async (ctx) => {
    const { m, r } = JSON.parse(ctx.request.body);
    const params = JSON.parse(m);
    let { subdir = '', token, category, data, identity } = params;
    let { type, status, url } = data;
    const projectSubdir = subdir;   // 子目录 提前缓存
    // 对 Promise 的错误做特殊处理
    if (type === 'promise') {
      status = data.desc.status;
      url = data.desc.url;
    } else if (data.desc && data.desc.url) {
      // React Vue Runtime Crash Image 等错误也要提取 url
      url = data.desc.url;
    }
    const message = JSON.stringify(data);
    // MD5加密
    const key = crypto.createHash('md5').update(identity + token + category + message).digest('hex');
    // 读取当前最新的 Source Map 文件
    let source = '';
    const dir = `${process.env.NODE_ENV}-${token}`;   // 存放 map 文件的目录
    const absDir = path.resolve(__dirname, config.get('sourceMapPath'), dir);
    logger.trace('sourceMapPath', absDir);
    // 目录存在，并且当前是错误类型的日志
    if (fs.existsSync(absDir) && category === 'error') {
      let readDir = fs.readdirSync(absDir);
      // 如果是 chunk-vendors 的错误，需做特殊处理
      if (type == 'runtime' && data.desc.prompt.indexOf('chunk-vendors') >= 0) {
        subdir = 'chunk-vendors';
        readDir = readDir.filter(name => name.split('.')[0] === subdir);
        subdir += '.';
      } else if (subdir) {   // 当传递的subdir非空时，需要过滤进行过滤
        // map 文件第一个点号之前的前缀必须与 subdir 相同
        readDir = readDir.filter(name => name.split('.')[0] === subdir);
        subdir += '.';    // 用于后续的去除前缀
      }
      readDir = readDir.sort((a, b) => b.replace(subdir, '').split('.')[0] - a.replace(subdir, '').split('.')[0]);
      source = readDir.length > 0 ? readDir[0] : '';
    }

    // UA信息解析
    // const ua = JSON.stringify(uaParser(ctx.headers['user-agent']));
    const ua = ctx.headers['user-agent'];
    const monitor = {
      project: token,
      project_subdir: projectSubdir,
      category,
      message,
      key,
      ua,
      source,
      identity,
      message_type: type && type.toLowerCase(),
      message_status: status,
      message_path: extractPath(url), // 提取路径
      day: moment().format('YYYYMMDD'),
      hour: moment().format('HH'),
      minute: moment().format('mm'),
      ctime: new Date(),   // 当前日期
    };
    if (r) {
      monitor.record = r;
    }
    const taskName = 'handleMonitor';// + Math.ceil(randomNum(0, 10) / 3);
    // 新增队列任务 生存时间60秒
    const job = queue.create(taskName, { monitor }).ttl(60000)
      .removeOnComplete(true);
    // job.on('failed', function(errorMessage){
    //   logger.trace(`${taskName} job faild`, errorMessage);
    // });
    job.save((err) => {
      if (err) {
        logger.trace(`${taskName} job failed!`);
      }
      logger.trace(`${taskName} job saved!`, job.id);
    });

    // queue.on('error', function( err ) {
    //   logger.trace('handleMonitor queue error', err);
    // });

    const blankUrl = path.resolve(__dirname, '../public/blank.gif');
    ctx.body = fs.readFileSync(blankUrl);    // 空白gif图
  });

  /**
   * 性能信息搜集
   */
  router.post('/pe.gif', async (ctx) => {
    let params;
    try {
      params = JSON.parse(ctx.request.body);
    } catch (e) {
      params = null;
    }
    if (!params) {
      ctx.body = {};
      return;
    }
    // UA信息解析
    // const ua = JSON.stringify(uaParser(ctx.headers['user-agent']));
    const ua = ctx.headers['user-agent'];
    const performance = {
      project: params.pkey,
      load: params.loadTime,
      ready: params.domReadyTime,
      paint: params.firstPaint,
      screen: params.firstScreen,
      identity: params.identity,
      ua,
      day: moment().format('YYYYMMDD'),
      hour: moment().format('HH'),
      minute: moment().format('mm'),
      referer: params.referer, // 来源地址
      referer_path: extractPath(params.referer), // 来源地址路径
      timing: params.timing ? JSON.stringify(params.timing) : null,
      resource: params.resource ? JSON.stringify(params.resource) : null,
    };
    delete params.pkey;
    delete params.loadTime;
    delete params.domReadyTime;
    delete params.firstPaint;
    delete params.firstScreen;
    delete params.identity;
    delete params.referer;
    delete params.timing;
    delete params.resource;
    performance.measure = JSON.stringify(params);
    // 新增队列任务 生存时间60秒
    const job = queue.create('handlePerformance', { performance }).ttl(60000)
      .removeOnComplete(true).save((err) => {
        if (err) {
          logger.trace('handlePerformance job failed!');
        }
        logger.trace('handlePerformance job saved!', job.id);
      });
    job.on('failed', (errorMessage) => {
      logger.trace('handlePerformance job faild', errorMessage);
    });
    // queue.on('error', function( err ) {
    //   // console.log('handlePerformance queue error', err);
    // });

    // // console.log(performance);
    // await services.common.createPerformance();
    ctx.body = {};
  });

  /**
   * 删除过期的 Source Map 日志文件
   */
  router.get('/smap/del', async (ctx) => {
    const { day = 21 } = ctx.query;
    // 删除21天前的文件
    const threeWeek = ~~moment().add(-day, 'days').startOf('day').format('YYYYMMDDHHmm');
    // 删除文件 需要调用web-api的接口
    const mapPath = path.resolve(__dirname, config.get('sourceMapPath'));
    logger.info(`source map目录：${mapPath}`);
    if (!fs.existsSync(mapPath)) {
      logger.info('source map目录不存在');
    }
    // 遍历项目
    MONITOR_PROJECT.forEach((dir) => {
      // 指定目录
      const currentDir = path.resolve(mapPath, `${process.env.NODE_ENV}-${dir}`);
      if (!fs.existsSync(currentDir)) {
        return;
      }
      const readDir = fs.readdirSync(currentDir);
      readDir.forEach((name) => {
        const num = ~~name.replace(/[^0-9]/ig, '');
        // 删除过期文件
        if (num <= threeWeek) {
          const filePath = path.resolve(currentDir, name);
          fs.unlinkSync(filePath);
        }
      });
    });
    ctx.body = {};
  });
}