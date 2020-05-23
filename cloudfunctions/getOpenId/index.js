// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // 调用该函数获取用户的openid
  // 参数: event
  // {
  // }
  // 返回
  // 正常:
  // {
  // event: 事件，传入参数
  // openid: 用户openid值，应为28位字符串
  // appid: 小程序appid
  // env: 小程序环境变量
  // }
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    env: wxContext.ENV
  }
}
