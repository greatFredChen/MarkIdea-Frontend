// app.js
import { Event } from './utils/event'
const sensitiveData = require('./sensitive-config.js')
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true
      })
    }

    // 打开调试开关
    wx.setEnableDebug({
      enableDebug: true
    })

    // openid在后台获取并在加载小程序时从后台返回
    this.globalData = {
      openid: '',
      logged: false,
      userInfo: {},
      avatarUrl: './user-unlogin.png',
      backendHost: sensitiveData.backendHost,
      backendKey: sensitiveData.backendKey,
      qqmapKey: sensitiveData.qqmapSdkKey,
      latitude: 0,
      longitude: 0,
      argsStack: [] // 全局参数传递栈，例如跨页面数据传送
    }
  },
  event: new Event(),
  manager: null,
  ideaConnectMng: []
})
