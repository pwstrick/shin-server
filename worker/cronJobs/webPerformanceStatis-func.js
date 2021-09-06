/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2021-04-01 11:16:38
 * @LastEditTime: 2021-09-06 13:25:25
 * @Description: 
 * @FilePath: /strick/shin-server/worker/cronJobs/webPerformanceStatis-func.js
 */
import moment from "moment";
import { setCronFormat } from "../../utils";
import { PERFORMANCT_RATE } from "../../utils/constant";
import services from "../../services";

/**
 * 计算 95% 的位置
 */
function getFloorNumber(count) {
  return Math.floor(count * PERFORMANCT_RATE);
}
/**
 * 计算24小时的性能数据
 */
async function calcHour({ project, day }) {
  let counts = await services.webMonitor.statisticPerformanceCount({
    project,
    day,
    group: "hour",
    attributes: ["hour"]
  });
  if(counts.length == 0)
    return null;
  const statistic = {
    x: [],
    load: [],
    ready: [],
    paint: [],
    screen: [],
    loadZero: 0,    //load时间为0的个数
    all: 0,         //日志总数
  };
  statistic.loadZero = await services.webMonitor.statisticPerformanceCount({ 
    project, day,
    other: {
      load: 0
    }
  });
  statistic.all = await services.webMonitor.statisticPerformanceCount({ 
    project, day,
  });
  counts = counts.map((value) => {
    return {
      ...value,
      offset: getFloorNumber(value.count)
    };
  });
  //逐条查询排序后排在95%位置的记录
  for(let i=0; i<counts.length; i++) {
    const { hour, offset } = counts[i];
    statistic.x.push(hour);
    const where = {
      project, 
      day, 
      hour,
    };
    const row1 = await services.webMonitor.getOneOrderPerformance(where, ['load'], offset);
    statistic.load.push(row1.id);
    const row2 = await services.webMonitor.getOneOrderPerformance(where, ['ready'], offset);
    statistic.ready.push(row2.id);
    const row3 = await services.webMonitor.getOneOrderPerformance(where, ['paint'], offset);
    statistic.paint.push(row3.id);
    const row4 = await services.webMonitor.getOneOrderPerformance(where, ['screen'], offset);
    statistic.screen.push(row4.id);
  }
  return { statistic, hours: counts };
}

/**
 * 计算每小时的性能
 */
async function calcMinute({ project, day, hour }) {
  //按指定小时的60分钟来计算
  let counts = await services.webMonitor.statisticPerformanceCount({
    project, 
    day,
    hour,
    group: 'minute',
    attributes: ['minute']
  });
  const statistic = {
    x: [],
    load: [],
    ready: [],
    paint: [],
    screen: [],
    loadZero: 0,
    all: 0,
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
  counts = counts.map(value => {
    return {
      ...value, 
      offset: getFloorNumber(value.count)
    }
  });
  //逐条查询排序后排在95%位置的记录
  for(let i=0; i<counts.length; i++) {
    const { minute, offset } = counts[i];
    statistic.x.push(minute);
    const where = {
      project, 
      day, 
      hour,
      minute
    };
    const row1 = await services.webMonitor.getOneOrderPerformance(where, ['load'], offset);
    statistic.load.push(row1.id);
    const row2 = await services.webMonitor.getOneOrderPerformance(where, ['ready'], offset);
    statistic.ready.push(row2.id);
    const row3 = await services.webMonitor.getOneOrderPerformance(where, ['paint'], offset);
    statistic.paint.push(row3.id);
    const row4 = await services.webMonitor.getOneOrderPerformance(where, ['screen'], offset);
    statistic.screen.push(row4.id);
  }
  return { statistic };
}
async function monitor() {
  logger.info("开始执行性能统计");
  const startTimestamp = Date.now();
  const day = moment().add(-1, 'days').format("YYYYMMDD");
  //判断数据库中是否已有day数据
  const exist = await services.webMonitor.getOnePerformanceStatis({date: day});
  if(exist) {
    logger.info("昨日的性能统计已完成");
    return;
  }
  const projects = await services.webMonitor.getPerformanceProjectList();
  logger.info(`性能统计项目:${projects.join(",")}`);
  for(let i=0; i<projects.length; i++) {
    const statis = {};
    const project = projects[i].key;
    const data = await calcHour({ project, day });
    if(!data)
      continue;
    statis.hour = data.statistic;
    const minute = {};
    for(let j=0; j<data.hours.length; j++) {
      const hour = data.hours[j].hour;
      const result = await calcMinute({ project, day, hour });
      minute[hour] = result.statistic;
    }
    statis.minute = minute;
    logger.info(`${project}性能统计结束`);
    await services.webMonitor.createPerformanceStatis({ date:day, statis:JSON.stringify(statis), project});
  }
  
  setCronFormat({ name: "性能统计", startTimestamp });
}
export default monitor;