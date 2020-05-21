// components/createPanel/createPanel.js
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
    switchButtonGroup: false,
    addTellHidden: true
  },

  lifetimes: {
    attached () {
      app.event.on('setButtonGroup', (switchButtonGroup) => {
        this.setData({
          switchButtonGroup
        })
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 授权
    getUserInfo: function (e) {
      app.event.emit('authorizeHidden', true)
      app.globalData.logged = e.detail.logged
      app.globalData.avatarUrl = e.detail.avatarUrl
      app.globalData.userInfo = e.detail.userInfo
    },
    // 点击选定(创建marker位置)触发
    settleMarker: function (e) {
      // 放置 marker label
      this.setData({
        addTellHidden: false
      })
    },
    // 点击取消(创建marker位置)触发
    cancelMarker: function () {
      app.event.emit('setcreating', false)
    },
    // 点击发布想法
    createMarker: function () {
      app.event.emit('setcreating', true)
    },
    // 新建marker模态窗
    async tapDialogButton (e) {
      const touch = e.detail.index
      if (touch === 1 && e.detail.title_input !== '') {
        // 确认
        // this.place_marker(e)
        wx.showLoading({
          title: '创建中'
        })
        const res = await app.ideaMng.createIdea(e)
        this.setData({
          addTellHidden: true
        })
        // 终止创建状态
        app.event.emit('setcreating', false)
        app.event.emit('setMarkers', res)
      } else if (touch === 1) {
        // 标题为空
        wx.showToast({
          title: '标题不能为空',
          icon: 'none',
          duration: 1000
        })
      } else {
        // 取消按钮
        this.setData({
          addTellHidden: true
        })
      }
      wx.hideLoading()
    }
  }
})
