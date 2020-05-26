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
    domain: {}
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
        // 获取当前中心对应的domain
        const position = {
          latitude: this.data.latitude,
          longitude: this.data.longitude
        }
        const domain = await app.domainMng.getLocalDomain(position)
        this.setData({
          domain
        })

        // 获取当前domain对应的所有结构
        const e = {
          domain_id: domain.domainId
        }
        await app.domainMng.getDomainContains(e)
      } catch (e) {
        console.log(e)
        wx.showToast({
          title: '获取想法失败',
          icon: 'none',
          duration: 2000
        })
        app.event.emit('setIdeas', { ideas: [], relationShip: [] })
      }
      wx.hideLoading()
    }
  }
})
