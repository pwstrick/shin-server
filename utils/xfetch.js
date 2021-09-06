/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2020-09-28 11:15:47
 * @LastEditTime: 2021-09-06 12:25:36
 * @Description: 
 * @FilePath: /strick/shin-server/utils/xfetch.js
 */
import axios from 'axios';
import config from 'config';

/**
 * 请求信息格式
 *
 * @param {object} req 请求参数
 * @param {object} res 返回参数
 * @param {number} ms  请求耗时
 */
const createInfo = (req, res, ms) => `
  ******************** request api start ******************
  ${req.method} ${req.baseURL}${req.url} ${ms}ms
  request params: ${JSON.stringify(req.params)}
  request data: ${JSON.stringify(req.data)}
  request body: ${JSON.stringify(res.data)}
  ******************** request api end ********************
`;

/**
 * api请求
 * @param {string} url     请求地址
 * @param {string} method  请求方法
 * @param {string} baseURL 默认域名地址
 * @param {object} params  请求参数（GET）
 * @param {object} data    请求参数（非GET）
 * @param {boolean} disableLog 是否关闭打印日志
 */
export default async ({ url, method, baseURL, params, data, disableLog, headers={} }) => {
  const start = Date.now();
  const conf = {
    url,
    method,
    baseURL: baseURL || config.get('services').internalApi,
  };
  const _conf = {
    headers: {
      ...headers
    },
  };
  if (method.toUpperCase() === 'GET' || params) {
    _conf.params = params;
  } else {
    !_conf.headers['Content-Type'] && (_conf.headers['Content-Type'] = 'application/json');
    if(typeof data === "string") {
      _conf.data = data;
    }else {
      _conf.data = JSON.stringify(data);
    }
  }
  const req = Object.assign(conf, _conf);
  req.validateStatus = status => (status < 500);
  const res = await axios(req);
  const end = Date.now();
  if (!disableLog) {
    logger.info(createInfo(req, res, (end - start)));
    global.logMessages && global.logMessages.push(createInfo(req, res, (end - start)));
  }
  return res;
};
