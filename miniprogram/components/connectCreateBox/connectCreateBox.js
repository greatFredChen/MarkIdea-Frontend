// components/connectCreateBox/connectCreateBox.js
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
    directional: 0,
    directionalArray: ['无向边', '有向边'],
    desCount: 0,
    inputValue: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindDirectionalChange (e) {
      this.setData({
        directional: e.detail.value
      })
      // 事件转发
      this.triggerEvent('directChange', e.detail.value)
    },
    bindinput (e) {
      this.setData({
        desCount: e.detail.value.length
      })
      // 事件转发
      this.triggerEvent('inputChange', e.detail.value)
    }
  }
})
