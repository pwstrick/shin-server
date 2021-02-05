/*
 * @Author: strick
 * @Date: 2021-01-04 15:08:42
 * @LastEditTime: 2021-02-05 13:43:10
 * @LastEditors: strick
 * @Description: 模板组件示例
 * @FilePath: /strick/shin-server/routers/template.js
 */
export default (router, services, middlewares) => {
  /**
   * 创建
   */
  router.post('/template/create', async (ctx) => {
      ctx.body = { code: 0, msg: "错误原因" };
  });

  /**
   * 处理
   */
  router.post('/template/handle', async (ctx) => {
    ctx.body = { code: 0 };
  });

  /**
   * 查询
   */
  router.get('/template/query', async (ctx) => {
    ctx.body = { code: 0, data: [
      {
        "id": "123456",
        "url": "http://localhost:6060/img/avatar.png",
        "name": "freedom" + Math.round(Math.random() * 10),
        "status": 0,
        "price": 9.8,
        "date": "2021-01-05T15:19:30.000Z",
        "udate": "2021-01-05T15:19:30.000Z",
        "urls": ["http://www.pwstrick.com", "https://www.cnblogs.com/strick"],
        "icon": [
          '//www.pwstrick.com/upload/avatar.png',
          '//www.pwstrick.com/usr/uploads/2020/02/4250591636.jpg',
        ],
        "csv": [
          {nick: "justify", uid: "1"},
          {nick: "freedom", uid: "2"}
        ],
        "file": [
          'http://localhost:6060/img/avatar.png'
        ]
      }, {
        "id": "234567",
        "url": "http://localhost:6060/img/cover.jpg",
        "name": "justify" + Math.round(Math.random() * 10),
        "status": 1,
        "price": 18,
        "date": "2021-01-05T15:19:29.000Z",
        "udate": "2021-01-05T15:19:30.000Z",
        "urls": [],
        "icon": [],
        "csv": [],
      }, {
        "id": "345678",
        "url": "http://localhost:6060/img/avatar.png",
        "name": "盐汽水真好喝",
        "status": 2,
        "price": 12,
        "date": "2021-01-05T15:17:52.000Z",
        "udate": "2021-01-05T15:19:30.000Z",
        "urls": [],
        "icon": [],
        "csv": [],
      }, 
      {
        "id": "4",
        "url": "http://localhost:6060/img/cover.jpg",
        "name": "jane",
        "status": 2,
        "price": 12,
        "date": "2021-01-05T15:17:52.000Z",
        "udate": "2021-01-05T15:19:30.000Z",
        "urls": [],
        "icon": [],
        "csv": [],
      }, {
        "id": "5",
        "url": "http://localhost:6060/img/avatar.png",
        "name": "小靖轩",
        "status": 2,
        "price": 12,
        "date": "2021-01-05T15:17:52.000Z",
        "udate": "2021-01-05T15:19:30.000Z",
        "urls": [],
        "icon": [],
        "csv": [],
      }, {
        "id": "6",
        "url": "http://localhost:6060/img/cover.jpg",
        "name": "凯文",
        "status": 2,
        "price": 12,
        "date": "2021-01-05T15:17:52.000Z",
        "udate": "2021-01-05T15:19:30.000Z",
        "urls": [],
        "icon": [],
        "csv": [],
      }, {
        "id": "7",
        "url": "http://localhost:6060/img/avatar.png",
        "name": "超级飞侠",
        "status": 2,
        "price": 12,
        "date": "2021-01-05T15:17:52.000Z",
        "udate": "2021-01-05T15:19:30.000Z",
        "urls": [],
        "icon": [],
        "csv": [],
      }, {
        "id": "8",
        "url": "http://localhost:6060/img/cover.jpg",
        "name": "乐迪",
        "status": 2,
        "price": 12,
        "date": "2021-01-05T15:17:52.000Z",
        "udate": "2021-01-05T15:19:30.000Z",
        "urls": [],
        "icon": [],
        "csv": [],
      }, {
        "id": "9",
        "url": "http://localhost:6060/img/avatar.png",
        "name": "小爱",
        "status": 2,
        "price": 12,
        "date": "2021-01-05T15:17:52.000Z",
        "udate": "2021-01-05T15:19:30.000Z",
        "urls": [],
        "icon": [],
        "csv": [],
      }
    ], count: Math.round(Math.random() * 100) };
  });

}