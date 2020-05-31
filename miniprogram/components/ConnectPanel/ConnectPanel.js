// components/ConnectPanel/ConnectPanel.js
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
    showMe: false
  },

  lifetimes: {
    attached () {
      app.event.on('menuConnectStatus', (status) => {
        if (status === this.data.showMe) {
          // 如果要求的状态与当前状态一致，不做变更
          return
        }
        if (status) {
          this.slideUp()
        } else {
          this.slideDown()
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
      this.animate('.connect-panel', [
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
      this.animate('.connect-panel', [
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
    returnMap () {
      // 关闭想法关联的按钮面板
      app.event.emit('menuButtonStatus', false)
      // wx.showToast({
      //   title: '返回浏览模式..',
      //   icon: 'loading',
      //   duration: 1500
      // })
      // 通知menuButton和map组件现在关闭连接状态
      app.event.emit('linkStatus', false)
    },
    showFilter: () => {
      app.event.emit('showFilterView')
    },
    showSearch: () => {
      app.event.emit('showSearchView')
    }
  }
})
