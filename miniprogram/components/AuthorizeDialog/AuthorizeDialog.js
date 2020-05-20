// components/AuthorizeDialog/AuthorizeDialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    authorizeHidden: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    logged: false,
    avatarUrl: '',
    userInfo: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGetUserInfo: function(e) {
      if (e.detail.userInfo) {
        this.setData({
          logged: true,
          avatarUrl: e.detail.userInfo.avatarUrl,
          userInfo: e.detail.userInfo,
        })
        let info = {
          logged: true,
          avatarUrl: e.detail.userInfo.avatarUrl,
          userInfo: e.detail.userInfo,
        }
        this.triggerEvent('authButton', info)
      }
    },
  }
})
