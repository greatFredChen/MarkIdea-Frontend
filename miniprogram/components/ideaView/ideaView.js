// components/ideaView/ideaView.js
import { IdeaType } from '../../class/IdeaType'
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
    ...(new IdeaType(Math.E)),
    author_id: -1,
    markerIcon: -1,
    ideaId: String(-1),
    deleteDialogHidden: true,
    buttons: [{ text: '取消' }, { text: '确认' }],
    relationship: {}
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
            backend_host: app.globalData.backendHost,
            ideaId
          }
        })
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
        console.log(JSON.stringify(e))
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
      // 传递fromId给connectDialog
      app.event.emit('getFromId', Number(this.data.ideaId))
      // 先关掉create-panel
      app.event.emit('menuButtonStatus', false)
      // 通知menuButton和map组件现在处于连接状态
      app.event.emit('linkStatus', true)
      // 隐藏idea详情页面
      this.setData({
        show: false
      })
      // wx.showToast({
      //   title: '进入关联模式..',
      //   icon: 'loading',
      //   duration: 1000
      // })
    },
    tapNavigator () {
      app.globalData.argsStack.push({
        _id: this.data.ideaId,
        title: this.data.title,
        description: this.data.description,
        markerIcon: this.data.markerIcon,
        items: this.data.items || []
      })
      console.log(app.globalData.argsStack)
      wx.navigateTo({
        url: '/pages/ideaEdit/ideaEdit?type=Edit'
      })
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
      app.event.on('closeIdeaView', () => {
        this.close()
      })
    },
    detached () {
      app.event.off('viewIdea')
    }
  }
})
