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
    show: false, // 展示 ideaView
    showPrivateBtns: false,
    title: '想法示例',
    description: '最近我去了一次海南看火箭发射，看的时候一脸懵逼，白烟是啥，黑线是啥，喷火的颜色又代表啥...为了下次看的时候不要再懵圈，我决定好好补一课！',
    author_id: -1,
    markerIcon: -1,
    attach: [
      // {
      //   title: '一去二三里',
      //   description: '烟村四五家'
      // }
    ],
    ideaId: String(-1),
    deleteDialogHidden: true,
    buttons: [{ text: '取消' }, { text: '确认' }]
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
        // console.log(res)
        if (res.result.code !== 0) {
          throw new Error(res)
        }
        delete res.result.code
        delete res.result.Msg
        this.setData({
          ...res.result,
          show: true,
          ideaId: String(ideaId),
          showPrivateBtns: app.globalData.openid === res.result.author_id
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
    tapLinkIdea () {
      // 点击了连接Idea按钮 让menu-button强制回到初始状态
      app.event.emit('menuButtonStatus', false)
    },
    bindbuttontap (e) {
      if (e.detail.index === 0) {
        // 删除对话框点击了取消事件
        this.setData({ deleteDialogHidden: true })
      } else if (e.detail.index === 1) {
        this.deleteConfirm()
      }
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
        // 调用了delete成功之后, 该对象就已经无效, 不要再有其引用
        await app.ideaManager.deleteIdea(this.data.ideaId)
        wx.showToast({ title: '删除成功' })
      } catch (e) {
        wx.showToast({
          title: '删除失败',
          icon: 'none',
          duration: 2000
        })
        console.log('删除失败')
        console.log(e)
      }
      wx.hideLoading()
    }
  },
  lifetimes: {
    attached () {
      app.event.on('viewIdea', (ideaId) => {
        this.fetchIdea(ideaId)
      })
      app.event.on('viewIdeaLocalUpdate', (pck) => {
        this.setData(pck)
      })
    },
    detached () {
      app.event.off('viewIdea')
    }
  }
})
