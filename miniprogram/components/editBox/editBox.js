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
    titleCount: 0,
    desCount: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindinput (e) {
      const pck = {}
      pck[e.currentTarget.id] = e.detail.value
      this.triggerEvent('editUpdate', pck)
      // 编辑产生的长度设置
      if (e.currentTarget.id === 'description') {
        this.setData({
          desCount: e.detail.value.length
        })
      }
      if (e.currentTarget.id === 'title') {
        if (e.detail.value.length === 0) {
          this.setData({
            titleCount: e.detail.value.length
          })
        }
      }
    },
    enter () {
      this.triggerEvent('enter')
    }
  },
  observers: {
    // 初次传值的长度设置
    title (title) {
      this.setData({
        titleCount: title.length
      })
    },
    description (description) {
      this.setData({
        desCount: description.length
      })
    }
  }
})
