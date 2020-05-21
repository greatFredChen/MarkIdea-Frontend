// components/ideaDialog/ideaDialog.js
Component({
  /**
   * 组件的属性列表 外部绑定
   */
  properties: {
    addTellHidden: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据 私有
   */
  data: {
    title_input: '',
    description_input: '',
    buttons: [{ text: '取消' }, { text: '确定' }]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 标题输入框
    saveUsertell: function (e) {
      this.setData({
        title_input: e.detail.value
      })
    },

    // 描述输入框
    saveUserDescription: function (e) {
      this.setData({
        description_input: e.detail.value
      })
    },

    // trigger转到外部实现窗口
    bindDialogButton: function (e) {
      const that = this
      const info = {
        title_input: that.data.title_input,
        description_input: that.data.description_input,
        index: e.detail.index
      }
      that.triggerEvent('dialogButton', info)
    }
  }
})
