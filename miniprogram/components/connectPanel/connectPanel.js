// components/connectPanel/connectPanel.js
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
      app.event.on('menuStatus', (status) => {
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
    }
  }
})
