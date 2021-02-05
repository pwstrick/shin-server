/*
 * @Author: strick
 * @Date: 2021-02-03 15:15:01
 * @LastEditTime: 2021-02-03 17:54:38
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
}