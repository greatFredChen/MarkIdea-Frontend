// components/createPanel/createPanel.js
import { wxsleep } from '../../utils/util'
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
    switchButtonGroup: false,
    latitude: -1,
    longitude: -1,
    showMe: false // 是否显示面板
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
      app.event.on('getPosition', (position) => {
        this.setData({
          latitude: position.latitude,
          longitude: position.longitude
        })
      })
      app.event.on('menuStatus', (status) => {
        if (status === this.data.showMe) {
          // 如果要求的状态与当前状态一致，不做变更
          return
        }
        if (status) {
          this.slideUp()
        } else {
          this.slideDown()
          app.event.emit('setcreating', false)
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
      this.animate('.create-panel', [
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
      this.animate('.create-panel', [
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
    },
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
    async createIdeaMiddleman ({ title, description, markerIcon }) {
      if (title !== '') {
        wx.showLoading({
          title: '创建中'
        })
        // console.log(title, description)
        try {
          await app.ideaManager.createIdea(title, description, markerIcon,
            this.data.latitude, this.data.longitude)
          console.log('创建想法成功')
          wx.hideLoading()
          wx.showToast({
            title: '修改成功'
          })
          await wxsleep(1000)
          // 终止创建状态
          app.event.emit('setcreating', false)
          app.event.emit('refreshLocalDomain')
          // 关闭编辑页
          app.event.emit('closeEdit')
        } catch (err) {
          await wx.hideLoading()
          await wx.showToast({
            title: '创建失败',
            icon: 'none',
            duration: 2000
          })
          console.log('创建想法失败')
          console.log(err)
        }
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
