/*
 * @Author: strick
 * @Date: 2021-02-02 16:51:51
 * @LastEditTime: 2023-04-24 18:00:36
 * @LastEditors: strick
 * @Description: 权限角色
 * @FilePath: /strick/shin-server/services/backendUserRole.js
 */
import models from '../models';
class BackendUserRole {

  /**
   * 获取角色列表
   */
  async getList(role, cursor, limit) {
    const list = await models.BackendUserRole
    .find({roleName: {$regex: (role ? role : "")}})
    .skip((cursor - 1) * limit)
    .limit(limit)
    .sort({ createTime: -1 });
    const count = await models.BackendUserRole
    .find({roleName: {$regex: (role ? role : "")}})
    .count();
    return { list, count };
  }

  /**
   * 获取角色权限列表
   */
  async getInfoById(roleId) {
    const res = await models.BackendUserRole.findOne({ _id: roleId });
    return res;
  }

  /**
   * 添加角色
   */
  async add(roleName, roleDesc, rolePermission) {
    const entity = new models.BackendUserRole({
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
    const res = await models.BackendUserRole.update({
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
    const res = await models.BackendUserRole.remove({ _id: roleId });
    return res;
  }

  /**
   * 获取某个角色的所有账号
   */
  async getAccountOfRoleName(roleName) {
    const role = await models.BackendUserRole.findOne({
      roleName,
    });
    if (!role) {
      return [];
    }
    const roleId = role._id;
    return models.BackendUserAccount.find({
      roles: roleId.toString(),
    });
  }

  /**
   * 查询匹配关键字的角色列表
   */
  async getRolesOfKeywords(keywords) {
    return models.BackendUserRole.find({
      roleName: new RegExp(keywords),
    });
  }
}

export default BackendUserRole;
