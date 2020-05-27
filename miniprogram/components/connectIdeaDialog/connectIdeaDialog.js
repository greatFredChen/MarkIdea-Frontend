// components/connectIdeaDialog/connectIdeaDialog.js
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
    connectDialogHidden: true,
    fromId: -1,
    directional: 0,
    relationType: '',
    toId: -1,
    latitude: -1, // 地图中心纬度
    longitude: -1 // 地图中心经度
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached () {
      // 连接窗口显示
      app.event.on('hideConnectDialog', (connectDialogHidden) => {
        this.setData({
          connectDialogHidden
        })
      })

      // 获取连接起始idea的id
      app.event.on('getFromId', (fromId) => {
        this.setData({
          fromId
        })
      })

      // 获取连接终点idea的id
      app.event.on('getToId', (toId) => {
        this.setData({
          toId
        })
      })

      // 获取地图中心经纬度
      app.event.on('getPosition', (position) => {
        this.setData({
          latitude: position.latitude,
          longitude: position.longitude
        })
      })
    },
    detached () {
      app.event.off('hideConnectDialog')
      app.event.off('getFromId')
      app.event.off('getToId')
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async confirmLink () {
      const event = {
        from: this.data.fromId,
        to: this.data.toId,
        directional: this.data.directional,
        type: this.data.relationType,
        latitude: this.data.latitude,
        longitude: this.data.longitude
      }
      await app.ideaConnectMng.createConnect(event)
    },
    cancelLink () {
      this.setData({
        connectDialogHidden: true,
        directional: 0,
        relationType: ''
      })
    },
    directChange (e) {
      this.setData({
        directional: Number(e.detail)
      })
    },
    inputChange (e) {
      this.setData({
        relationType: e.detail
      })
    }
  }
})
