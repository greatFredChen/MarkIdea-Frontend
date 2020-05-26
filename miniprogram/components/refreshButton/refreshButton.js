// components/refreshButton/refreshButton.js
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
    domain_id: -1
  },

  /**
  * s生命周期
  */
  lifetimes: {
    async attached () {
      app.event.on('getCenter', (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
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
      app.event.emit('getCenterRequest', {})
      wx.showLoading({
        title: '刷新中'
      })
      // 刷新
      try {
        // 获取当前中心对应的domain_id
        await wx.cloud.callFunction({
          name: 'getLocalDomain',
          data: {
            latitude: this.data.latitude,
            longitude: this.data.longitude,
            key: app.globalData.qqmapKey,
            create_domain: false,
          }
        }).then(res => {
          if (res.result.code === 201 || res.result.code === 200) {
            this.setData({
              domain_id: res.result.domain.domainId
            })
          } else {
            console.log(res.result.code, res.result.error)
            throw new Error(res.result.msg)
          }
        }).catch(err => {
          wx.showToast({
            title: '获取domain_id失败',
            icon: 'none',
            duration: 2000
          })
          console.log(err)
        })

        // 获取当前domain_id对应的所有结构
        await wx.cloud.callFunction({
          name: 'getDomainContains',
          data: {
            domain_id: this.data.domain_id,
            backend_host: app.globalData.backendHost
          }
        }).then(async res => {
          if (res.result.code === 200) {
            app.event.emit('setIdeas', res.result.idea)
          } else {
            console.log(res.result.code, res.result.error)
            throw new Error(res.result.msg)
          }
        }).catch(err => {
          wx.showToast({
            title: '获取想法失败',
            icon: 'none',
            duration: 2000
          })
          app.event.emit('setIdeas', [])
          console.log(err)
        })
      } catch (e) {
        console.log(e)
        wx.showToast({
          title: '获取想法失败',
          icon: 'none',
          duration: 2000
        })
        app.event.emit('setIdeas', [])
      }
      wx.hideLoading()
    }
  }
})
