// components/ideaView/ideaView.js
/**
 * 用法
 * 查看想法详情组件
 * app.event.emit('viewIdea', '300')
 */
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
    // 是否展示删除想法按钮, 如果用户查看的idea不属于自己则不显示
    showDeleteButton: false,
    show: false,
    title: '想法示例',
    description: '最近我去了一次海南看火箭发射，看的时候一脸懵逼，白烟是啥，黑线是啥，喷火的颜色又代表啥...为了下次看的时候不要再懵圈，我决定好好补一课！',
    author_id: -1,
    attach: [
      // {
      //   title: '一去二三里',
      //   description: '烟村四五家'
      // }
    ],
    ideaId: String(-1),
    OPENID: -1,
    deleteDialogHidden: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 首先向云函数查询，返回填入 data 并显示 dialog
     * @param {ideaId，向云函数查询的依据} ideaId
     */
    async fetchIdea (ideaId) {
      wx.showLoading({
        title: '请稍后',
        mask: true
      })
      try {
        const res = await wx.cloud.callFunction({
          name: 'ideaView',
          data: {
            ideaId
          }
        })
        console.log(res)
        if (res.result.code !== 0) {
          throw new Error(res)
        }
        delete res.result.code
        delete res.result.Msg
        this.setData({
          ...res.result,
          show: true,
          ideaId: String(ideaId),
          showDeleteButton: app.globalData.openid === res.result.author_id
        })
      } catch (e) {
        console.log(e)
        wx.showToast({
          title: '想法飞走了',
          icon: 'none',
          duration: 1500,
          mask: false
        })
      }
      wx.hideLoading()
    },
    close () {
      this.setData({
        show: false
      })
    },
    tapDeleteIdea () {
      // 点击了删除Idea按钮, 显示确认删除对话框
      this.setData({ deleteDialogHidden: false })
    },
    deleteCancel () {
      // 删除对话框点击了取消事件
      this.setData({ deleteDialogHidden: true })
    },
    async deleteConfirm () {
      // 删除对话框点击了确认删除事件
      // 隐藏ideaView和确认删除对话框
      this.setData({
        deleteDialogHidden: true,
        show: false
      })
      wx.showLoading({ title: '请稍后' })
      try {
        const res = await wx.cloud.callFunction({
          name: 'deleteIdea',
          data: {
            idea_id: this.data.ideaId,
            user_id: app.globalData.openid,
            key: app.globalData.backendKey,
            backend_host: app.globalData.backendHost
          }
        })
        // console.log('res')
        // console.log(res)
        if (res.result.code !== 204) {
          throw res
        }
        app.event.emit('deleteIdea', this.data.ideaId)
      } catch (e) {
        wx.showToast({
          title: '删除失败',
          icon: 'none',
          duration: 2000
        })
        // console.log('删除失败')
        // console.log(e)
      }
      wx.hideLoading()
    }
  },
  lifetimes: {
    attached () {
      app.event.on('viewIdea', (ideaId) => {
        // 为什么在此处 set OPENID？
        // attached 中globalData 未初始化
        this.setData({
          OPENID: app.globalData.openid
        })
        this.fetchIdea(ideaId)
      })
      app.event.on('viewIdeaLocalUpdate', ({ title, description }) => {
        console.log(title, description)
        this.setData({
          title,
          description
        })
      })
    },
    detached () {
      app.event.off('viewIdea')
    }
  }
})
