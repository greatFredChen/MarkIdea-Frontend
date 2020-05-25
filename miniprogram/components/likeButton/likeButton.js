// components/likeButton.js
const app = getApp()
Component({

  lifetimes: {
    attached () {
      // 获取用户点赞数据
      wx.cloud.callFunction({
        name: 'getUserLikeIdeaInfo',
        data: {
          idea_id: this.properties.ideaId,
          user_id: app.globalData.openid
        }
      }).then(res => {
        if (res.result.code !== 200) {
          const err = {
            msg: '返回状态码不为 200',
            error: res,
            code: res.result.code
          }
          throw err
        }
        this.setData({
          liked: res.result.liked,
          likes: res.result.likes
        })
      }).catch(err => {
        wx.showToast({
          title: '获取Idea点赞信息失败:' + err.msg,
          icon: 'none',
          duration: 2000
        })
        console.log('likeButton:获取Idea点赞信息失败')
        console.log(err)
      })
    }
  },

  /**
   * 组件的属性列表
   */
  properties: {
    // 这个点赞按钮对应的ideaId
    ideaId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    liked: false,
    likes: 0,
    enable: true // 是否有效, 防止用户短时间内多次操作出现bug
  },

  /**
   * 组件的方法列表
   */
  methods: {
    ontap: function () {
      if (this.data.enable !== true) {
        wx.showToast({
          title: '您操作得太频繁了, 请稍后再试',
          icon: 'none',
          duration: 2000
        })
        return
      }
      // 先假装事务成功, 因为大概率成功.... 达到响应快的目的
      this.setData({
        liked: !this.data.liked,
        likes: this.data.likes + (this.data.liked ? -1 : 1),
        enable: false // 组件变得不可用
      })
      wx.cloud.callFunction({
        name: 'likeIdea',
        data: {
          idea_id: this.properties.ideaId,
          user_id: app.globalData.openid
        }
      }).then(res => {
        if (res.result.code !== 200) {
          const err = {
            msg: '返回状态码不为 200',
            error: res,
            code: res.result.code
          }
          throw err
        }
        // 更新数据
        this.setData({
          liked: res.result.liked,
          likes: res.result.likes,
          enable: true // 组件重新变得可用
        })
        // 触发idea点赞数事件
        app.event.emit('ideaLikesChange', {
          ideaId: this.properties.ideaId,
          likes: this.data.likes
        })
      }).catch(err => {
        wx.showToast({
          title: '更新Idea点赞信息失败' + err.msg,
          icon: 'none',
          duration: 2000
        })
        console.log('更新Idea点赞信息失败')
        console.log(err)
      })
    }
  }
})
