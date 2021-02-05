/*
 * @Author: strick
 * @Date: 2021-02-03 14:06:51
 * @LastEditTime: 2021-02-05 16:14:49
 * @LastEditors: strick
 * @Description: 脚本测试
 * @FilePath: /strick/shin-server/scripts/demo.js
 */
import services from '../services';

async function test() {
  const result = await services.backendUserAccount.find();
  console.log("script test", result);
}
test();
