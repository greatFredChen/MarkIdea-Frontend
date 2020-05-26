// components/createPanel/createPanel.js
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
    switchButtonGroup: false
  },

  lifetimes: {
    attached () {
      app.event.on('setButtonGroup', (switchButtonGroup) => {
        this.setData({
          switchButtonGroup
        })
      })
      app.event.on('createIdeaMiddleman', (payload) => {
        this.createIdeaMiddleman(payload)
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 授权
    getUserInfo: function (e) {
      app.event.emit('authorizeHidden', true)
      app.globalData.logged = e.detail.logged
      app.globalData.avatarUrl = e.detail.avatarUrl
      app.globalData.userInfo = e.detail.userInfo
    },
    // 点击选定(创建想法位置)触发
    settleIdea: function (e) {
      // 放置 想法 label
      wx.navigateTo({
        url: '/pages/ideaEdit/ideaEdit?type=Create'
      })
    },
    // 点击取消(创建创建位置)触发
    cancelIdea: function () {
      app.event.emit('setcreating', false)
    },
    // 点击发布想法
    createIdea: function () {
      app.event.emit('setcreating', true)
    },
    // 新建页面与管理者之间的中间人
    async createIdeaMiddleman ({ title, description }) {
      if (title !== '') {
        wx.showLoading({
          title: '创建中'
        })
        // console.log(title, description)
        await app.ideaMng.createIdea(title, description)
        // 终止创建状态
        app.event.emit('setcreating', false)
        wx.hideLoading()
        wx.showToast({
          title: '创建成功'
        })
      } else {
        // 标题为空
        wx.showToast({
          title: '标题不能为空',
          icon: 'none',
          duration: 1000
        })
      }
    }
  }
})
