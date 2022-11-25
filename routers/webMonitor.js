/*
 * @Author: strick
 * @Date: 2021-02-25 15:40:31
 * @LastEditTime: 2022-11-25 15:28:11
 * @LastEditors: strick
 * @Description:
 * @FilePath: /strick/shin-server/routers/webMonitor.js
 */
import config from 'config';
import moment from 'moment';
import path from 'path';
import crypto from "crypto";
const sourceMap = require("source-map");
const fs = require("fs");
import { PERFORMANCT_RATE } from "../utils/constant";
import { formatDate } from '../utils/tools';
import uaParser from "ua-parser-js";
export default (router, services, middlewares) => {
  /**
   * 读取指定的Source-Map文件
   */
  function readSourceMap(filePath) {
    let parsedData = null;
    try {
      parsedData = fs.readFileSync(filePath, 'utf8');
      parsedData = JSON.parse(parsedData);
    }catch(e) {
      logger.info(`sourceMap：error`);
    }
    return parsedData;
  }
  /**
   * 对Vue的错误做特殊处理
   */
  function handleVue(message) {
    const stacks = message.stack.split("\n");
    if(stacks.length <= 1)
      return;
    let coordinate
    if(stacks[0] === message.desc) {
      stacks[1] = stacks[1].replace(/\)/g, "");
      coordinate  = stacks[1].split(":");
    }else {
      stacks[0] = stacks[0].replace(/\)/g, "");
      coordinate  = stacks[0].split(":");
    }
    if(coordinate.length <= 2) {
      return;
    }
    message.lineno = ~~coordinate[coordinate.length - 2];
    message.colno = ~~coordinate[coordinate.length - 1];
  }
  /**
   * 处理映射逻辑
   */
  async function getSourceMap(row) {
    // 拼接映射文件的地址
    // const url = config.get("services").webHttpsApi + '/smap/' + process.env.NODE_ENV + '-' + row.project + '/' + row.source;
    const filePath = path.resolve(__dirname, config.get("sourceMapPath"), process.env.NODE_ENV + '-' + row.project + '/' + row.source);
    logger.info(`filePath：${filePath}`);
    // logger.info(`sourceMap：${url}`);
    let { message } = row;
    message = JSON.parse(message);
    // logger.info(`sourceMap：${message}`);
    // VUE 错误需要特殊处理
    if(message.type === "vue") {
      handleVue(message);
      row.message = JSON.stringify(message);
    }
    // 不存在行号或列号
    if(!message.lineno || !message.colno) {
      return row;
    }     
    logger.info(`sourceMap`);     
    // 打包后的sourceMap文件
    // const rawSourceMap = await httpSourceMap(url);
    const rawSourceMap = readSourceMap(filePath);
    if(!rawSourceMap) {
      return row;
    }
    const errorPos = {
      line: message.lineno,
      column: message.colno,
    };
    // 过传入打包后的代码位置来查询源代码的位置
    const consumer = await new sourceMap.SourceMapConsumer(rawSourceMap);
    // 获取出错代码在哪一个源文件及其对应位置
    const originalPosition = consumer.originalPositionFor({ 
      line: errorPos.line,
      column: errorPos.column,
    });
    // 根据源文件名寻找对应源文件
    const sourceIndex = consumer.sources.findIndex(
      (item) => item === originalPosition.source
    );
    const sourceCode = consumer.sourcesContent[sourceIndex];
    logger.trace('sourceCode', !!sourceCode);     
    if(sourceCode) {
      row.sourceInfo = {
        code: sourceCode,
        lineno: originalPosition.line,
        path: originalPosition.source
      };
      // row.sourceCode = sourceCode;
      // row.lineno = originalPosition.line;
    }
    // 销毁，否则会报内存访问超出范围
    consumer.destroy();
    return row;
  }
  function initMonitorQuery(ctx) {
    // 图表默认已小时计算
    const { id, category, project, start, end, curPage = 1, 
      pageSize = 10, identity, match=1, chart=2, status, path } = ctx.query;
    const other = {};
    const messages = [];
    // if(msg) {
    //   // 全文检索时还需处理特殊字符的转义
    //   match == 1 ?
    //     messages.push(`+*${msg.toLocaleLowerCase().replace(/"/g, "")}*`) :
    //     messages.push(`%${msg}%`);
    // }
    let messageType;
    let currentCategory = category;
    //传递类别以及其子类别
    if(Array.isArray(category)) {
      currentCategory = category[0];
      messageType = category[1];
    }
    return {
      id, currentCategory, messages, messageType, messageStatus: status, messagePath: path, 
      project, start, end, curPage, pageSize, identity, match, chart, other
    }
  }
  /**
   * 解析代理信息
   */
  function parseAgent(item) {
    if(item.ua.indexOf("{") == -1)
      item.ua = JSON.stringify(uaParser(item.ua));
  }
  /**
  * 监控日志明细
  */
  router.get(
    '/monitor/list',
    middlewares.checkAuth('backend.monitor.log'),
    async (ctx) => {
      const { id, currentCategory, project, start, end, 
        curPage, pageSize, identity, match, other, 
        messageType, messageStatus, messagePath } = initMonitorQuery(ctx);
      const { rows, count } = await services.webMonitor.getMonitorList({ 
        id, 
        category: currentCategory, 
        msg: ctx.query.msg,
        messageType, messageStatus, messagePath,
        match,
        project, 
        start, 
        end, 
        curPage, 
        pageSize,
        identity,
        other
      });
      // 查找出错误的原始代码
      const sourceRows = await Promise.all(rows.map(item => {
        // UA转换
        parseAgent(item);
        //错误类型，有映射文件
        if(item.category === 'error' && item.source) {
          return getSourceMap(item);
        }
        return item;
      }));
      ctx.body = { code: 0, data: sourceRows, count, query: ctx.query };
    },
  );
  /**
  * 监控日志明细图表
  */
 router.get(
  '/monitor/list/chart',
  middlewares.checkAuth('backend.monitor.log'),
  async (ctx) => {
    const { id, currentCategory, project, start, end, 
      identity, chart, messageType, messageStatus, messagePath } = initMonitorQuery(ctx);
    let attribute, days=[];
    switch(+chart) {
      case 1:   //按天
        attribute = "day";
        break;
      case 2:   //按小时
        //以开始时间作为 day 的值
        if(start) {
          //先计算出两天的相差的天数，只取年月日
          let diff = moment(end.split(" ")[0]).diff(moment(start.split(" ")[0]), 'days')
          for(let i=0; i<=diff; i++) {
            days.push(moment(start).add(i, "days").format("YYYYMMDD"));
          }
        }else {
          //默认处理
          days.push(moment().format("YYYYMMDD"));
        }
        attribute = "hour";
        break;
    }
    if(days.length === 0) {
      const counts = await services.webMonitor.getMonitorListChart({ 
        id, 
        category: currentCategory, 
        msg: ctx.query.msg,
        messageType, messageStatus, messagePath,
        project, 
        start, 
        end, 
        identity,
        attribute
      });
      const x = counts.map(value => value.hour);
      const y = counts.map(value => value.count);
      ctx.body = { code: 0, data: {
        x, y
      }};
      return;
    }
    const coor = {
      x: [],
      y: []
    };
    //遍历
    for(let day of days) {
      const counts = await services.webMonitor.getMonitorListChart({ 
        id, 
        category: currentCategory, 
        msg: ctx.query.msg,
        messageType, messageStatus, messagePath,
        project, 
        start, 
        end, 
        identity,
        day,
        attribute
      });
      // console.log(counts)
      const substr = day.substr(4);
      const x = counts.map((value, index) => (index === 0 ? (substr + value.hour) : value.hour));
      const y = counts.map(value => value.count);
      coor.x = coor.x.concat(x);
      coor.y = coor.y.concat(y);
    }
    ctx.body = { code: 0, data: coor};
  },
);

/**
 * 日志上下文查询
 */
router.get(
  '/monitor/context',
  middlewares.checkAuth('backend.monitor.log'),
  async (ctx) => {
    let { prevId, nextId } = ctx.query;
    prevId = +prevId;   //类型转换
    nextId = +nextId;   //类型转换
    let rows = [];
    if(prevId) {
      // 读取前10条
      rows = await services.webMonitor.getMonitorContext({ from: prevId, to: prevId+9 });
    }else if(nextId) {
      // 读取后10条
      rows = await services.webMonitor.getMonitorContext({ from: nextId-9, to: nextId });
    }
    ctx.body = { code: 0, data: rows };
  },
);

  /**
   * 统计日志趋势图
   */
  router.get(
    '/monitor/chart',
    middlewares.checkAuth('backend.monitor.log'),
    async (ctx) => {
      let { project, start, end } = ctx.query;
      //默认展示前面7天的数据
      if(!start || !end) {
        start = moment().add(-8, 'days').format("YYYYMMDD");
        end = moment().add(-1, 'days').format("YYYYMMDD");
      }
      const list = await services.webMonitor.getStatisList({ start, end });
      if(!list) {
        ctx.body = { code: 0, data: {}};
        return;
      }
      //保存趋势数值
      const days = [];
      const daysErrorHash = {},
        days500ErrorHash = {},
        days502ErrorHash = {},
        days504ErrorHash = {},
        daysAllCountHash = {};
      list.forEach(current => {
        const digits = current.date.toString().split("").splice(-4);
        const today = digits.slice(0, 2).join("") + '-' + digits.slice(-2).join("");
        days.push(today);       //将数字格式化成日期 例如03-18
        let statis = JSON.parse(current.statis);  //格式化统计数据
        statis = caculateFiled(project, statis);
        daysErrorHash[today] = statis.errorCount;
        days500ErrorHash[today] = statis.error500Count;
        days502ErrorHash[today] = statis.error502Count;
        days504ErrorHash[today] = statis.error504Count;
        daysAllCountHash[today] = statis.allCount || (statis.errorCount + statis.ajaxCount + statis.consoleCount + statis.eventCount + statis.redirectCount);
      });
      ctx.body = { code: 0, data: {
        daysErrorHash,
        days500ErrorHash,
        days502ErrorHash,
        days504ErrorHash,
        daysAllCountHash
      }};
    }
  );

 /**
  * 按天读取监控日志
  */
 router.get(
  '/monitor/date',
  middlewares.checkAuth('backend.monitor.log'),
  async (ctx) => {
    let { project, date } = ctx.query;
    const row = await services.webMonitor.getOneStatis({ date });
    if(!row) {
      return ctx.body = { code: 0, data: {}};
    }
    row.statis = JSON.parse(row.statis);
    ctx.body = { code: 0, data: row.statis[project]};
  }
);

  /**
   * 计算字段的累加值
   */
  function caculateFiled(project, statis) {
    if(project) {
      statis = statis[project];  //若选择了项目，则展示项目信息
    }else {
      //否则将各个项目的数值累加
      const calc = {};
      Object.keys(statis).forEach(pro => {
        Object.keys(statis[pro]).forEach(field => {
          // 若不存在就重新赋值
          if(!calc[field]) {
            calc[field] = statis[pro][field];
            return;
          }
          // 否则累加
          calc[field] += statis[pro][field];
        });
      });
      statis = calc;
    }
    return statis;
  }
  /**
   * 统计日志信息
   */
  router.get(
    '/monitor/statistic',
    middlewares.checkAuth('backend.monitor.log'),
    async (ctx) => {
      const { project } = ctx.query;
      //昨日的统计信息
      const yesterdayDate = moment().add(-1, 'days').format("YYYYMMDD");  //格式化的昨天日期
      let yesterdayStatis = await services.webMonitor.getOneStatis({ date: yesterdayDate });
      if(!yesterdayStatis) {
        yesterdayStatis = {};
      }else {
        yesterdayStatis = JSON.parse(yesterdayStatis.statis);     //格式化存储的数据
        yesterdayStatis = caculateFiled(project, yesterdayStatis);
      }
      const {
        allCount=0,
        errorCount=0,
        errorSum=0,
        error500Count=0,
        error502Count=0,
        error504Count=0,
        ajaxCount=0,
        consoleCount=0,
        eventCount=0,
        redirectCount=0
      } = yesterdayStatis;
      //其他日期
      const yesterday = moment().add(-1, 'days').startOf('day').format("YYYY-MM-DD HH:mm");  //昨天凌晨
      const yesterdayNow = moment().add(-1, 'days').format("YYYY-MM-DD HH:mm");  //昨天现在的时间
      const today = moment().startOf('day').format("YYYY-MM-DD HH:mm");    //今天凌晨
      const tomorrow = moment().add(1, 'days').startOf('day').format("YYYY-MM-DD HH:mm"); //明天凌晨
      const todayFilter = { project, from: today, to: tomorrow };
      const yesterdayFilter = { project, from: yesterday, to: yesterdayNow };
      // const yesterdayAllDayFilter = { project, from: yesterday, to: today };

      //日志数
      const todayCount = await services.webMonitor.statisticCount(todayFilter);
      const yesterdayCount = allCount ? allCount : (errorCount + ajaxCount + consoleCount + eventCount + redirectCount);

      //错误数
      const yesterdayErrorCount = await services.webMonitor.statisticCount({ category: "error", ...yesterdayFilter });
      const yesterdayErrorSum = await services.webMonitor.statisticSum({ field: "digit", category: "error", ...yesterdayFilter });
      const todayErrorCount = await services.webMonitor.statisticCount({ category: "error", ...todayFilter });
      const todayErrorSum = await services.webMonitor.statisticSum({ field: "digit", category: "error", ...todayFilter });
      const todayErrorCountRate = yesterdayErrorCount ? (todayErrorCount - yesterdayErrorCount) / yesterdayErrorCount * 100 : 0;
      const todayErrorSumRate = yesterdayErrorSum ? (todayErrorSum - yesterdayErrorSum) / yesterdayErrorSum * 100 : 0;

      //通信错误数
      // const yesterday50XErrorCountFilter = { category: "error", ...yesterdayAllDayFilter };
      const today50XErrorCountFilter = { category: "error", ...todayFilter };
      const message500 = { message_status: 500 };
      const message502 = { message_status: 502 };
      const message504 = { message_status: 504 };
      const yesterday500ErrorCount = error500Count;
      const yesterday502ErrorCount = error502Count;
      const yesterday504ErrorCount = error504Count;
      const today500ErrorCount = await services.webMonitor.statisticCount({ ...today50XErrorCountFilter, other: message500 });
      const today502ErrorCount = await services.webMonitor.statisticCount({ ...today50XErrorCountFilter, other: message502 });
      const today504ErrorCount = await services.webMonitor.statisticCount({ ...today50XErrorCountFilter, other: message504 });

      //通信、打印、事件、跳转数
      const todayAjaxCount = await services.webMonitor.statisticCount({ category: "ajax", ...todayFilter });
      const todayConsoleCount = await services.webMonitor.statisticCount({ category: "console", ...todayFilter });
      const todayEventCount = await services.webMonitor.statisticCount({ category: "event", ...todayFilter });
      const todayRedirectCount = await services.webMonitor.statisticCount({ category: "redirect", ...todayFilter });

      ctx.body = { code: 0, data: {
        todayCount,
        yesterdayCount,
        todayErrorCount,
        todayErrorSum,
        todayAjaxCount,
        todayConsoleCount,
        todayEventCount,
        todayRedirectCount,
        todayErrorCountRate: todayErrorCountRate.toFixed(2),
        todayErrorSumRate: todayErrorSumRate.toFixed(2),
        yesterday500ErrorCount,
        yesterday502ErrorCount,
        yesterday504ErrorCount,
        today500ErrorCount,
        today502ErrorCount,
        today504ErrorCount,
      }};
    },
  );


  /**
  * 创建性能监控项目
  */
  router.post(
    "/monitor/performance/project/create",
    middlewares.checkAuth("backend.monitor.performance.project"),
    async (ctx) => {
      const { name, id } = ctx.request.body;
      if(id) {
        const exist = await services.webMonitor.getOnePerformanceProject({ 
          name,
          id: {
            $not: id
          }
        });
        if(exist) {
          ctx.body = { code: 1, msg: '项目已存在' };
          return;
        }
        // 更新操作
        await services.webMonitor.updatePerformanceProject(id, { name });
        ctx.body = { code: 0 };
        return;
      }
      // MD5加密 取前面的16位
      const key = crypto.createHash('md5').update(name).digest('hex').substring(0, 16);
      const keyData = await services.webMonitor.getOnePerformanceProject({ key });
      // 当根据key可以找到数据，则报错
      if (keyData) {
        ctx.body = { code: 1, msg: '项目已存在' };
        return;
      }
      // 创建
      await services.webMonitor.createPerformanceProject({ name, key });
      ctx.body = { code: 0 };
    }
  );
  
    /**
     * 性能项目列表
     */
    router.get(
      "/monitor/performance/project/list",
      middlewares.checkAuth("backend.monitor.performance.project"),
      async (ctx) => {
        const { curPage = 1, pageSize = 10, name } = ctx.query;
        const { count, rows } = await services.webMonitor.getPerformanceProjectList({ name, curPage, pageSize});
        ctx.body = {
          code: 0,
          data: rows.map((item) => {
            item.ctime = formatDate(item.ctime);
            return item;
          }),
          count
        };
      }
    );
  
    /**
     * 删除性能项目
     */
    router.post(
      "/monitor/performance/project/del",
      middlewares.checkAuth("backend.monitor.performance.project"),
      async (ctx) => {
        const { id } = ctx.request.body;
        await services.webMonitor.delPerformanceProject({ id });
        ctx.body = { code: 0 };
      }
    );

    function getFloorNumber(count) {
      return Math.floor(count * PERFORMANCT_RATE);
    }

    /**
     * 读取性能的历史记录
     */
    async function getHistoryList({ project, start, end, hour }) {
      const list = [];
      for(let day = start; day <= end; day++) {
        const statistic = {
          x: [],
          load: [],
          ready: [],
          paint: [],
          screen: [],
          loadZero: 0,    //load时间为0的个数
          all: 0,    //日志总数
          day
        };
        const history = await services.webMonitor.getOnePerformanceStatis({ date: day, project });
        //不存在历史记录就返回默认信息
        if(!history) {
          continue;
        }
        const historyStatis = JSON.parse(history.statis);
        let loadList, readyList, paintList, screenList;
        //如果未传递小时
        if(!hour) {
          const { x, load, ready, paint, screen, loadZero, all=0 } = historyStatis.hour;
          //补全24小时
          for(let i=0; i<=23; i++) {
            statistic.x.push(i);
            statistic.load.push(0);
            statistic.ready.push(0);
            statistic.paint.push(0);
            statistic.screen.push(0);
          }
          loadList = await services.webMonitor.getPerformanceListByIds(load);
          readyList = await services.webMonitor.getPerformanceListByIds(ready);
          paintList = await services.webMonitor.getPerformanceListByIds(paint);
          screenList = await services.webMonitor.getPerformanceListByIds(screen);
          x.forEach(value => {
            //UA转换
            parseAgent(loadList[0]);
            parseAgent(readyList[0]);
            parseAgent(paintList[0]);
            parseAgent(screenList[0]);
            statistic.load[value] = loadList[0];
            statistic.ready[value] = readyList[0];
            statistic.paint[value] = paintList[0];
            statistic.screen[value] = screenList[0];
            loadList.shift();
            readyList.shift();
            paintList.shift();
            screenList.shift();
          });
          statistic.loadZero = loadZero;
          statistic.all = all;
        }else {
          //包含小时数据
          if(historyStatis.minute[hour]) {
            //补全60小时
            for(let i=0; i<=59; i++) {
              statistic.x.push(i);
              statistic.load.push(0);
              statistic.ready.push(0);
              statistic.paint.push(0);
              statistic.screen.push(0);
            }
            const { x, load, ready, paint, screen, loadZero, all=0 } = historyStatis.minute[hour];
            loadList = await services.webMonitor.getPerformanceListByIds(load);
            readyList = await services.webMonitor.getPerformanceListByIds(ready);
            paintList= await services.webMonitor.getPerformanceListByIds(paint);
            screenList = await services.webMonitor.getPerformanceListByIds(screen);
            x.forEach(value => {
              //UA转换
              parseAgent(loadList[0]);
              parseAgent(readyList[0]);
              parseAgent(paintList[0]);
              parseAgent(screenList[0]);
              statistic.load[value] = loadList[0];
              statistic.ready[value] = readyList[0];
              statistic.paint[value] = paintList[0];
              statistic.screen[value] = screenList[0];
              loadList.shift();
              readyList.shift();
              paintList.shift();
              screenList.shift();
            });
            statistic.loadZero = loadZero;
            statistic.all = all;
          }
        }
        list.push(statistic);
      }
      return list;
    }
    /**
     * 读取性能的历史记录
     */
    async function getTodayList({ project, day, hour }) {
      let counts;
      const statistic = {
        x: [],
        load: [],
        ready: [],
        paint: [],
        screen: [],
        loadZero: 0,    //load时间为0的个数
        all: 0,    //日志总数
        day
      };
      statistic.loadZero = await services.webMonitor.statisticPerformanceCount({ 
        project, day, hour,
        other: {
          load: 0
        }
      });
      statistic.all = await services.webMonitor.statisticPerformanceCount({ 
        project, day, hour,
      });
      if(!hour) {
        //补全24小时
        for(let i=0; i<=23; i++) {
          statistic.x.push(i);
          statistic.load.push(0);
          statistic.ready.push(0);
          statistic.paint.push(0);
          statistic.screen.push(0);
        }
        counts = await services.webMonitor.statisticPerformanceCount({
          project, 
          day, 
          group: 'hour',
          attributes: ['hour']
        });
        counts = counts.map(value => {
          return {
            ...value, 
            offset: getFloorNumber(value.count)
          }
        });
        // console.log(counts)
        //逐条查询排序后排在95%位置的记录
        for(let i=0; i<counts.length; i++) {
          const { hour, offset } = counts[i];
          // statistic.x.push(hour);
          const where = {
            project, 
            day, 
            hour,
          };
          const row1 = await services.webMonitor.getOneOrderPerformance(where, ['load'], offset);
          //UA转换
          parseAgent(row1);
          statistic.load[hour] = row1;
          const row2 = await services.webMonitor.getOneOrderPerformance(where, ['ready'], offset);
          parseAgent(row2);
          statistic.ready[hour] = row2;
          const row3 = await services.webMonitor.getOneOrderPerformance(where, ['paint'], offset);
          parseAgent(row3);
          statistic.paint[hour] = row3;
          const row4 = await services.webMonitor.getOneOrderPerformance(where, ['screen'], offset);
          parseAgent(row4);
          statistic.screen[hour] = row4;
        }
      }else {
        //补全60小时
        for(let i=0; i<=59; i++) {
          statistic.x.push(i);
          statistic.load.push(0);
          statistic.ready.push(0);
          statistic.paint.push(0);
          statistic.screen.push(0);
        }
        //按指定小时的60分钟来计算
        counts = await services.webMonitor.statisticPerformanceCount({
          project, 
          day,
          hour,
          group: 'minute',
          attributes: ['minute']
        });
        // console.log(counts)
        //逐条查询排序后排在95%位置的记录
        for(let i=0; i<counts.length; i++) {
          const { minute, offset } = counts[i];
          // statistic.x.push(minute);
          const where = {
            project, 
            day, 
            hour,
            minute
          };
          const row1 = await services.webMonitor.getOneOrderPerformance(where, ['load'], offset);
          parseAgent(row1);
          statistic.load[minute] = row1;
          const row2 = await services.webMonitor.getOneOrderPerformance(where, ['ready'], offset);
          parseAgent(row2);
          statistic.ready[minute] = row2;
          const row3 = await services.webMonitor.getOneOrderPerformance(where, ['paint'], offset);
          parseAgent(row3);
          statistic.paint[minute] = row3;
          const row4 = await services.webMonitor.getOneOrderPerformance(where, ['screen'], offset);
          parseAgent(row4);
          statistic.screen[minute] = row4;
        }
      }
      return statistic;
    }
    /**
     * 性能统计
     */
    router.get(
      "/monitor/performance/statistic",
      middlewares.checkAuth("backend.monitor.performance.dashboard"),
      async (ctx) => {
        let { project, start, end, hour } = ctx.query;
        //今日的统计信息
        const today = moment().format("YYYYMMDD");      //格式化的日期
        start = +start;
        end = +end;
        //结束时间非今天，就查找历史记录
        if(today != end) {
          const data = await getHistoryList({ project, start, end, hour });
          ctx.body = { code: 0, data: data};
          return;
        }
        let statistic = [];
        //开始时间和结束时间不是同一天
        if(start != end) {
          statistic = await getHistoryList({ project, start, end: (end-1), hour });
        }
        //结束时间是今天，就计算今天的统计信息
        const current = await getTodayList({ project, day: end, hour });
        statistic.push(current);
        ctx.body = { code: 0, data: statistic};
      }
    );
    /**
     * 读取一条性能日志
     */
    router.get(
      '/monitor/performance/get',
      middlewares.checkAuth('backend.monitor.performance.dashboard'),
      async (ctx) => {
        const {
          id,
        } = ctx.query;
        // 结束时间是今天，就计算今天的统计信息
        const row = await services.webMonitor.getOnePerformance({ id });
        ctx.body = { code: 0, data: row };
      },
    );
  /**
   * 读取性能时序
   */
  router.get(
    '/monitor/performance/flow',
    middlewares.checkAuth('backend.monitor.performance.dashboard'),
    async (ctx) => {
      const {
        id,
        type,
        range,
        curPage = 1,
        pageSize = 10,
        start,
        end,
      } = ctx.query;
      const { count, rows } = await services.webMonitor.getPerformanceFlow({
        id, type, range, curPage, pageSize, start, end,
      });
      ctx.body = { code: 0, data: rows, count };
    },
  );
    /**
     * 飞书告警 demo演示
     */
    router.post(
      "/monitor/send/warn",
      async (ctx) => {
        let { email, text } = ctx.request.body;
        await services.webMonitor.tenantSend({ email, text });
        ctx.body = { code: 0 };
      }
    );
}

