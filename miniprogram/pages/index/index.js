// index.js
const app = getApp()
// util.js
const util = require('../../utils/util.js')

Page({
  data: {
    sdk_version: '',
    authorizeHidden: true
  },

  // 加载
  onLoad: async function () {
    const that = this
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib'
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              const userInfo = JSON.parse(res.rawData)
              app.globalData.logged = true
              app.globalData.avatarUrl = userInfo.avatarUrl
              app.globalData.userInfo = userInfo
            }
          })
        } else {
          // 若用户没有授权过
          that.setData({
            authorizeHidden: false
          })
        }
      }
    })

    // 获取微信用户当前版本号
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sdk_version: res.SDKVersion
        })
      }
    })

    // 获取微信openid
    wx.cloud.callFunction({
      name: 'getOpenId',
      data: {},
      success: res => {
        app.globalData.openid = res.result.openid
      },
      fail: err => {
        wx.showToast({
          title: '获取openid失败',
          icon: 'none',
          duration: 1500
        })
        console.log(err)
      }
    })

    if (!util.compareVersion(that.data.sdk_version, '2.9.0')) {
      // 基础库版本过低
      wx.showToast({
        title: '微信基础库版本过低，请升级微信版本',
        icon: 'none',
        duration: 1500
      })
    }

  },
  onReady () {
    // 设置事件监听
    app.event.on('authorizeHidden', (status) => {
      this.setData({
        authorizeHidden: status
      })
    })

    app.event.on('setcreating', (status) => {
      app.event.emit('setButtonGroup', status)
      app.event.emit('setCrossImage', status)
    })

    // // 查看想法示例
    // app.event.emit('viewIdea', '300')
  }
})
