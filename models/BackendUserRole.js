/*
 * @Author: strick
 * @Date: 2021-02-02 16:52:31
 * @LastEditTime: 2021-02-02 16:53:08
 * @LastEditors: strick
 * @Description: 账号角色
 * @FilePath: /strick/shin-server/models/BackendUserRole.js
 */
export default ({ mongodb }) => mongodb.model('BackendUserRole', {
  // 角色名称
  roleName: String,
  // 角色简介
  roleDesc: String,
  // 角色拥有的权限
  rolePermission: Array,
  // 创建时间
  createTime: {
    type: Date,
    default: Date.now,
  },
  // 更新时间
  updateTime: {
    type: Date,
    default: Date.now,
  },
  // 状态
  status: {
    type: Number,
    default: 1,
  },
}, 'user_role');
