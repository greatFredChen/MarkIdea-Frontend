// components/detail/detail.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    markid: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    title: '标题',
    author: '作者',
    time: '发布时间',
    like: 0,
    idea: 'idea'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindtap () {
      this.setData({
        like: this.data.like + 1
      })
      this.triggerEvent('like', {
        like: this.data.like,
        id: this.properties.markid
      })
    }
  },

  observers: {
    markid: function (payload) {
      // 此处应该获取对应markid的数据
      this.setData({
        like: 0
      })
    }
  }
})
