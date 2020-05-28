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
    toId: -1
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
      // 创建想法关联确认
      const type = this.data.relationType
      if (!type || type === '') {
        wx.showToast({
          title: '关联关系类型不能为空!',
          icon: 'none',
          duration: 1500
        })
        return
      }
      // 若输入框不为空，则进行连接
      wx.showLoading({
        title: '正在创建....'
      })
      try {
        await app.ideaManager.createRelationship({
          from: this.data.fromId,
          to: this.data.toId,
          directional: this.data.directional,
          type: type
        })
        wx.hideLoading()
        // 提示创建成功
        wx.showToast({
          title: '想法关联成功',
          icon: 'success',
          duration: 1500
        })
        // 创建relationship后刷新地图
        app.event.emit('refreshLocalDomain')
        // 关掉关联窗口
        this.setData({
          connectDialogHidden: true
        })
      } catch (err) {
        wx.hideLoading()
        wx.showToast({
          title: '创建想法关联失败',
          icon: 'none',
          duration: 1500
        })
        console.log('创建想法关联失败')
        console.log(err)
      }
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
