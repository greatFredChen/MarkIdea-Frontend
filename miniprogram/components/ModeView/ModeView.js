// components/ModeView/ModeView.js
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
    linkMode: false
  },

  lifetimes: {
    attached () {
      app.event.on('linkStatus', (linkMode) => {
        this.setData({
          linkMode
        })
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
