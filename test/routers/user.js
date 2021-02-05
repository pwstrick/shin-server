/*
 * @Author: strick
 * @Date: 2021-02-03 14:17:34
 * @LastEditTime: 2021-02-05 16:10:19
 * @LastEditors: strick
 * @Description: 账户的路由层测试
 * @FilePath: /strick/shin-server/test/routers/user.js
 */
const userName = `test+${Date.now()}@shin.com`;
const password = '123456';

describe('GET /user', () => {
  const url = '/user';
  it('注册成功：返回用户id和注册时间', (done) => {
    api
    .get(url)
    .set('Authorization', authToken)
    .send({
      userName,
      password,
      realName: '测试账号',
      cellphone: '13800138000',
      roles: '*',
    })
    .expect(200)
    .end((err, res) => {
      if (err) done(err);
      const { username } = res.body;
      expect(username).to.be.not.empty;
    //   expect(createTime).to.be.not.empty;
    //   console.log(res.body)
      done();
    });
  });
});

describe('GET /user/list', () => {
  const url = '/user/list';
  it('获取用户列表成功', (done) => {
    api
    .get(url)
    .set('Authorization', authToken)
    .expect(200, done);
  });
});
