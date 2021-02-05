/*
 * @Author: strick
 * @Date: 2021-02-03 14:17:34
 * @LastEditTime: 2021-02-03 14:27:44
 * @LastEditors: strick
 * @Description: 账户的服务层测试
 * @FilePath: /strick/shin-server/test/services/user.js
 */
import backendUserRole from '../../services/backendUserRole';

describe('用户角色', () => {
  it('获取指定id的角色信息', async () => {
    const service = new backendUserRole(models);
    const res = await service.getInfoById('584a4dc24c886205bd771afe');
    // expect(2).toBe(2);
    // expect(res.rolePermisson).to.be.an('array');
  });
});
