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
    domain_id: -1,
    scale: -1,
  },

  /**
  * s生命周期
  */
  lifetimes: {
    async attached () {
      app.event.on('getCenter', (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          scale: res.scale
        })
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    refreshMap: async function() {
      // 先获取经度和纬度
      app.event.emit('getCenterRequest', {})
      // 刷新
      try {
        // 获取当前中心对应的domain_id
        let _ = await wx.cloud.callFunction({
          name: 'getLocalDomain',
          data: {
            latitude: this.data.latitude,
            longitude: this.data.longitude,
            key: app.globalData.qqmapKey,
            create_domain: true,
            backend_host: app.globalData.backendHost,
            backend_key: app.globalData.backendKey
          },
        }).then(res => {
          if(res.result.code === 0) {
            this.setData({
              domain_id: res.result.domainId
            })
          } else {
            throw new Error()
          }
        }).catch(err => {
          wx.showToast({
            title: '获取domain_id失败',
            icon: 'none',
            duration: 2000
          })
          console.log(err)
        })

        // 获取当前domain_id对应的所有marker
        let markers = []
        let ___ = await wx.cloud.callFunction({
          name: 'getDomainContains',
          data: {
            domain_id: this.data.domain_id,
            backend_host: app.globalData.backendHost
          },
        }).then(res => {
          if(res.result.code === 0) {
            let markers = res.result.idea
            markers = app.ideaMng.addMarkerAttr(markers, this.data.scale)
            app.event.emit('setMarkers', markers)
          } else {
            throw new Error()
          }
        }).catch(err => {
          wx.showToast({
            title: '获取markers失败',
            icon: 'none',
            duration: 2000
          })
          app.event.emit('setMarkers', [])
          console.log(err)
        })
      } catch(e) {
        console.log(e)
        wx.showToast({
          title: '获取markers失败',
          icon: 'none',
          duration: 2000
        })
        app.event.emit('setMarkers', [])
      }
    }
  }
})
