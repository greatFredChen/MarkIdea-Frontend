// components/RefreshButton/RefreshButton.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    latitude: '',
    longitude: '',
    domain: {}
  },

  /**
  * s生命周期
  */
  lifetimes: {
    attached () {
      app.event.on('getCenter', (position) => {
        this.setData({
          latitude: position.latitude,
          longitude: position.longitude
        })
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    refreshMap: async function () {
      // 先获取经度和纬度
      app.event.emit('getCenterRequest')
      wx.showLoading({
        title: '刷新中'
      })
      // 刷新
      try {
        // 获取当前中心对应的domain
        const position = {
          latitude: this.data.latitude,
          longitude: this.data.longitude
        }
        const domain = await app.domainManager.getLocalDomain(position)
        this.setData({ domain }) // 尚且未知这个domain用来干啥...
        const res = await domain.getContains()
        app.event.emit('setGraph', { ideas: res.ideas, relationships: res.relationships, clear: false })
      } catch (e) {
        console.log(e)
        wx.showToast({
          title: '获取想法失败',
          icon: 'none',
          duration: 2000
        })
        app.event.emit('setGraph', { ideas: [], relationships: [], clear: true })
      }
      wx.hideLoading()
    },
    // 获取用户授权
    onGetUserInfo: function (e) {
      if (e.detail.userInfo) {
        app.globalData.logged = true
        app.globalData.avatarUrl = e.detail.userInfo.avatarUrl
        app.globalData.userInfo = e.detail.userInfo
      } else {
        wx.showToast({
          title: 'Get userInfo failed!',
          icon: 'none',
          duration: 2000
        })
      }
    }
  }
})
