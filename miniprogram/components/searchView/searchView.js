// components/searchView/searchView.js
/**
 * 搜索组件
 */
const app = getApp()
const db = wx.cloud.database()
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
    inputVal: '',
    inputShown: false,
    resultList: null,
    linkMode: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close: function () {
      this.setData({
        show: false
      })
    },
    showInput: function () {
      this.setData({
        inputShown: true
      })
    },
    clearInput: function () {
      this.setData({
        inputVal: '',
        inputShown: false
      })
    },
    inputTyping: function (event) {
      this.setData({
        inputVal: event.detail.value
      })
    },
    confirm: async function () {
      const input = this.data.inputVal
      const id = Number(input)
      if (!isNaN(id) && id >= 0) {
        wx.showLoading({
          title: '查询中'
        })
        const res = await this.idSearch(id)
        if (res !== null) {
          this.setData({
            resultList: [res]
          })
        } else {
          this.setData({
            resultList: []
          })
        }
        wx.hideLoading()
      }
    },
    idSearch: async function (id) {
      try {
        const res = await db.collection('Idea').doc(String(id)).get()
        return res.data
      } catch (err) {
        return null
      }
    }
  },

  lifetimes: {
    attached () {
      app.event.on('showSearchView', () => {
        this.setData({ show: true })
        app.event.emit('menuButtonStatus', false)
      })

      app.event.on('hideSearchView', () => {
        this.setData({ show: false })
      })

      app.event.on('linkStatus', (linkMode) => {
        this.setData({
          linkMode
        })
      })
    }
  }
})
