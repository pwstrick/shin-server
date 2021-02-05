/*
 * @Author: strick
 * @Date: 2020-12-22 14:54:23
 * @LastEditTime: 2021-02-03 14:02:19
 * @Description: 业务工具接口
 * @FilePath: /strick/shin-server/routers/tool.js
 */
import crypto from "crypto";
import { string10to62 } from "../utils";
const murmurhash = require('../utils/murmurhash');

export default (router, services, middlewares) => {
  /**
   * 创建和编辑通用配置
   */
  router.post(
    "/tool/config/create",
    middlewares.checkAuth("backend.tool.config"),
    async (ctx) => {
      const { id, title, content } = ctx.request.body;
      let result;
      //MD5加密
      const key = crypto.createHash("md5").update(title).digest("hex");
      const keyData = await services.tool.getOneConfig({ key });
      //编辑
      if (id) {
        const data = await services.tool.getOneConfig({ id });
        //当根据key可以找到数据，并且本次修改了 title，则报错
        if (keyData && data.title != title) {
          ctx.body = { code: 1, msg: "标题已存在" };
          return;
        }
        result = await services.tool.editConfig({ id, title, content });
        ctx.body = { code: 0 };
        return;
      }

      //当根据key可以找到数据，则报错
      if (keyData) {
        ctx.body = { code: 1, msg: "标题已存在" };
        return;
      }
      //创建
      result = await services.tool.createConfig({ title, content, key });
      ctx.body = { code: 0 };
    }
  );

  /**
   * 创建和编辑通用配置
   */
  router.get(
    "/tool/config/query",
    middlewares.checkAuth("backend.tool.config"),
    async (ctx) => {
      const { rows, count } = await services.tool.getConfigList();
      ctx.body = { code: 0, data: rows, count };
    }
  );

  /**
   * 删除通用配置
   */
  router.post(
    "/tool/config/del",
    middlewares.checkAuth("backend.tool.config"),
    async (ctx) => {
      const { id } = ctx.request.body;
      await services.tool.delConfig({ id });
      ctx.body = { code: 0 };
    }
  );

  /**
   * 创建和修改短链
   */
  router.post('/tool/short/create',
  middlewares.checkAuth("backend.tool.shortChain"),
  async (ctx) => {
    const { url, id } = ctx.request.body;
    //存在ID
    if(id) {  //修改
      let result = await services.tool.getOneShortChain({ id });
      await services.tool.updateShortChain({
        id,
        url,
        short: result.short
      });
      ctx.body = { code: 0 };
      return;
    }
    //murmurhash算法
    const short = string10to62(murmurhash.v3(url));
    //根据 key 查询短链数据
    let result = await services.tool.getOneShortChain({ short });
    if(result) {
      ctx.body = { code: 1, msg: "短链已存在" };
      return;
    }
    //创建
    result = await services.tool.createShortChain({
      url,
      short,
    });
    ctx.body = { code: 0, data: result };
  });

  /**
   * 短链查询
   */
  router.get('/tool/short/query',
  middlewares.checkAuth("backend.tool.shortChain"),
  async (ctx) => {
    const { curPage = 1, short, url } = ctx.query;
    const { rows, count } = await services.tool.getShortChainList({ curPage, short, url});
    ctx.body = { code:0, data: rows, count };
  });

  /**
   * 短链删除
   */
  router.post('/tool/short/del',
  middlewares.checkAuth("backend.tool.shortChain"),
  async (ctx) => {
    const { id } = ctx.request.body;
    //读取数据
    const data = await services.tool.getOneShortChain({ id });
    const result = await services.tool.delShortChain(data);
    ctx.body = result > 0 ? { code: 0 } : { code: 1 };
  });
};
