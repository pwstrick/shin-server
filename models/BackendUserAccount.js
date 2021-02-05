/*
 * @Author: strick
 * @Date: 2021-02-02 16:52:54
 * @LastEditTime: 2021-02-02 16:53:19
 * @LastEditors: strick
 * @Description: 管理后台账号
 * @FilePath: /strick/shin-server/models/backendUserAccount.js
 */
export default ({ mongodb }) => mongodb.model('BackendUserAccount', {
  // 用户名
  userName: {
    type: String,
    index: true,
  },
  // 密码
  password: String,
  // 真实姓名
  realName: String,
  // 手机号
  cellphone: String,
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
  // 密码过期时间
  passwordExpireTime: Date,
  // 角色
  roles: Array,
  // 加密秘钥
  salt: String,
  // 状态
  status: {
    type: Number,
    default: 1,
  },
  // 在线状态
  online: {
    type: Number,
    default: 0,
  },
}, 'user_account');
