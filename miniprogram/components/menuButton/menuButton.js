// components/menuButton/menuButton.js
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
    status: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindtap () {
      this.setData({
        status: !this.data.status
      })
      app.event.emit('menuStatus', this.data.status)
    }
  }
})
