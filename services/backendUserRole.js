/*
 * @Author: strick
 * @Date: 2021-02-02 16:51:51
 * @LastEditTime: 2021-02-03 10:40:58
 * @LastEditors: strick
 * @Description: 权限角色
 * @FilePath: /strick/shin-server/services/backendUserRole.js
 */
class BackendUserRole {
  constructor(models) {
    this.BackendUserRole = models.BackendUserRole;
    this.BackendUserAccount = models.BackendUserAccount;
  }

  /**
   * 获取角色列表
   */
  async getList(role, cursor, limit) {
    const list = await this.BackendUserRole
    .find({roleName: {$regex: (role ? role : "")}})
    .skip((cursor - 1) * limit)
    .limit(limit)
    .sort({ createTime: -1 });
    const count = await this.BackendUserRole
    .find({roleName: {$regex: (role ? role : "")}})
    .count();
    return { list, count };
  }

  /**
   * 获取角色权限列表
   */
  async getInfoById(roleId) {
    const res = await this.BackendUserRole.findOne({ _id: roleId });
    return res;
  }

  /**
   * 添加角色
   */
  async add(roleName, roleDesc, rolePermission) {
    const entity = new this.BackendUserRole({
      roleName,
      roleDesc,
      rolePermission,
    });
    const res = await entity.save();
    return res;
  }

  /**
   * 更新角色信息
   */
  async update(id, data) {
    const res = await this.BackendUserRole.update({
      _id: id,
    }, {
      $set: data,
      updateTime: new Date(),
    });
    return res;
  }

  /**
   * 删除角色
   */
  async remove(roleId) {
    const res = await this.BackendUserRole.remove({ _id: roleId });
    return res;
  }

  /**
   * 获取某个角色的所有账号
   */
  async getAccountOfRoleName(roleName) {
    const role = await this.BackendUserRole.findOne({
      roleName,
    });
    if (!role) {
      return [];
    }
    const roleId = role._id;
    return this.BackendUserAccount.find({
      roles: roleId.toString(),
    });
  }

  /**
   * 查询匹配关键字的角色列表
   */
  async getRolesOfKeywords(keywords) {
    return this.BackendUserRole.find({
      roleName: new RegExp(keywords),
    });
  }
}

export default BackendUserRole;
