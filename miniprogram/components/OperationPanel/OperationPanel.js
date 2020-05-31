// components/OperationPanel/OperationPanel.js
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
    latitude: -1,
    longitude: -1,
    showMe: false // 是否显示面板
  },

  lifetimes: {
    attached () {
      app.event.on('setButtonGroup', (switchButtonGroup) => {
        this.setData({
          switchButtonGroup
        })
      })
      // app.event.on('setChosenPosition', (position) => {
      //   this.setData({
      //     latitude: position.latitude,
      //     longitude: position.longitude
      //   })
      // })
      app.event.on('menuStatus', (status) => {
        if (status === this.data.showMe) {
          // 如果要求的状态与当前状态一致，不做变更
          return
        }
        if (status) {
          this.slideUp()
        } else {
          this.slideDown()
          app.event.emit('setcreating', false)
        }
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    slideUp () {
      this.setData({
        showMe: true
      })
      this.animate('.operation-panel', [
        {
          translate3d: [0, 200, 0]
        },
        {
          translate3d: [0, 0, 0]
        }
      ], 500, () => {
      })
    },
    slideDown () {
      this.animate('.operation-panel', [
        {
          translate3d: [0, 0, 0]
        },
        {
          translate3d: [0, 200, 0]
        }
      ], 500, () => {
        this.setData({
          showMe: false
        })
      })
    },
    // 授权
    getUserInfo: function (e) {
      app.event.emit('authorizeHidden', true)
      app.globalData.logged = e.detail.logged
      app.globalData.avatarUrl = e.detail.avatarUrl
      app.globalData.userInfo = e.detail.userInfo
    },
    // 点击选定(创建想法位置)触发
    settleIdea: function (e) {
      // 放置 想法 label
      wx.navigateTo({
        url: '/pages/ideaEdit/ideaEdit?type=Create'
      })
    },
    // 点击取消(创建创建位置)触发
    cancelIdea: function () {
      app.event.emit('setcreating', false)
    },
    // 点击发布想法
    createIdea: function () {
      app.event.emit('setcreating', true)
    },
    showFilter: () => {
      app.event.emit('showFilterView')
    },
    showSearch: () => {
      app.event.emit('showSearchView')
    }
  }
})
