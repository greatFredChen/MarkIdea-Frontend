// components/editBox/editBox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: String,
    description: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    wordsCount: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindinput (e) {
      const pck = {}
      pck[e.currentTarget.id] = e.detail.value
      this.triggerEvent('editUpdate', pck)
      if (e.currentTarget.id === 'description') {
        this.setData({
          wordsCount: e.detail.value.length
        })
      }
    },
    enter () {
      this.triggerEvent('enter')
    }
  }
})
