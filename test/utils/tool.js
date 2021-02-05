/*
 * @Author: strick
 * @Date: 2021-02-03 14:17:34
 * @LastEditTime: 2021-02-03 14:28:05
 * @LastEditors: strick
 * @Description: 工具测试
 * @FilePath: /strick/shin-server/test/utils/tool.js
 */
import moment from 'moment';

describe("各类工具", () => {
  it("moment", () => {
    // console.log('测试', moment(Date.now()).add(-1, 'day').format('YYYY-MM-DD'))
    // console.log('测试', moment('2020-11-12').add(1, 'd').format('YYYY-MM-DD'));
    // const tmp = moment(Date.now()).add(-1, 'day');
    // console.log(tmp.add(8, 'hours').format("YYYY-MM-DD HH:mm"))
    // console.log(moment("2020-11-13T07:06:57.000Z").format("YYYY-MM-DD HH:mm"))
    // console.log(moment(Date.now()).add(-1, 'day').add(8, 'hours').utcOffset("+00:00").format('YYYY-MM-DD HH:mm'));
    // console.log(moment("2020-08-17T08:28:08.000Z"));
    // const start = moment().week(moment().week() - 1).startOf('isoWeek').format("YYYY-MM-DD HH:mm:ss");
    // const end = moment().week(moment().week() - 1).endOf('isoWeek').format("YYYY-MM-DD HH:mm:ss");
    // console.log(start, end);
    // console.log(moment('2020-11-09').add(1, 'd').format('YYYY-MM-DD'))
  });
  it("array.map", () => {
    let ids = [1, 2].map((element) => {
      if (element == 1) return null;
      return element;
    });
    expect(ids.length).to.equal(2);
  });
});
