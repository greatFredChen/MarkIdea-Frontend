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
    show: false,
    title: '想法示例',
    description: '最近我去了一次海南看火箭发射，看的时候一脸懵逼，白烟是啥，黑线是啥，喷火的颜色又代表啥...为了下次看的时候不要再懵圈，我决定好好补一课！',
    attach: [
      // {
      //   title: '一去二三里',
      //   description: '烟村四五家'
      // }
    ]
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
          show: true
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
    }
  },
  lifetimes: {
    attached () {
      app.event.on('viewIdea', (ideaId) => {
        this.fetchIdea(ideaId)
      })
    },
    detached () {
      app.event.off('viewIdea')
    }
  }
})
