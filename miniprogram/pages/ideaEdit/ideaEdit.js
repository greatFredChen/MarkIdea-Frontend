// miniprogram/pages/ideaEdit/ideaEdit.js
import { wxsleep } from '../../utils/util'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: '',
    title: '',
    description: '',
    inEditPreview: 0,
    _id: -1,
    markerIconIndex: -1,
    icons: [], // for view list
    ideaIconRecordList: [] // for view getter
  },
  bindPickerChange (e) {
    this.setData({
      markerIconIndex: Number(e.detail.value)
    })
  },
  bindtap (e) {
    this.setData({
      inEditPreview: Number(e.currentTarget.id)
    })
  },
  bindEditUpdate (pck) {
    this.setData(pck.detail)
  },
  enter () {
    this[`enter${this.data.type}`]()
  },
  async enterCreate () { // 创建页面中按下确定按钮
    const pck = this.getPackage()
    const { title, description, markerIcon } = { ...pck }
    if (title !== '') {
      wx.showLoading({
        title: '创建想法中'
      })
      try {
        await app.ideaManager.createIdea(title, description, markerIcon, app.globalData.latitude, app.globalData.longitude)
        console.log('创建想法成功')
        wx.hideLoading()
        wx.showToast({
          title: '创建成功'
        })
        await wxsleep(1000)
        // 终止创建状态
        app.event.emit('setcreating', false)
        app.event.emit('refreshLocalDomain')
        // 关闭编辑页
        wx.navigateBack()
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
  },
  async enterEdit () { // 编辑页面按下按钮
    try {
      wx.showLoading({
        title: '发送电波中...'
      })
      const pck = this.getPackage()
      const idea = app.ideaManager.ideas.get(Number(this.data._id))
      // 获得icon的资源id
      const markerIcon = app.resourceManager.ideaIconRecordList[this.data.markerIconIndex].id
      await idea.edit({
        title: this.data.title,
        description: this.data.description,
        markerIcon
      })
      // 更新查看详情页
      app.event.emit('viewIdeaLocalUpdate', pck)
      wx.hideLoading()
      wx.showToast({
        title: '修改成功'
      })
      await wxsleep(1000)
      wx.navigateBack()
    } catch (err) {
      console.log(err)
      wx.hideLoading()
      wx.showToast({
        title: '修改失败',
        icon: 'none'
      })
    }
  },
  getPackage () {
    // 当修改可编辑或者可提交的内容，需要连带修改的有
    // 后期可以用一个类来统一管理
    // a. getPackage()                      [args    in package out]           [f, g]             [edit]
    // b. loadEdit()                        [package in args    set] [warning] [o]                [edit]
    // c. event viewIdeaLocalUpdate         [package in package set] [warning] [m]                [noedit]
    // d. event singleIdeaUpdate            [package in args    set] [warning] [n]                [edit]
    // f. enterCreate                       [package in package out]           [k]                [noedit]
    // g. enterEdit                         [package in package out]           [c, d, p]          [noedit]
    // h. cloudFunction ideaEdit            [net     in args    out]                              [edit]
    // k. ideaManager::createIdea           [args    in args    net]           [l]                [edit]
    // l. cloudFunction createIdea          [net     in package set] [warning]                    [noedit]
    // m. ideaView.wxml/js                                                                        [edit]
    // n. wedeaMap.wxml/js                                                                        [noedit]
    // o. ideaEdit.wxml/js                                                                        [edit]
    // p. Idea::edit                        [args    in net     out]           [h, d]             [edit]
    return {
      // 修改的项
      title: this.data.title,
      description: this.data.description,
      markerIcon: app.resourceManager.ideaIconRecordList[this.data.markerIconIndex].id
    }
  },
  /**
   * 在 onLoad 中调用
   * @param {构造函数的和确认函数名字后缀 ['Create', 'Edit', 'Discuss']} type
   * @param {负载} payload
   */
  async constructor (type, payload) {
    const funcName = `load${type}`
    if (Object.prototype.hasOwnProperty.call(this, funcName)) {
      // 公共构造
      const icons = []
      for (const index in app.resourceManager.ideaIconRecordList) {
        icons.push({
          id: index,
          name: app.resourceManager.ideaIconRecordList[index].name
        })
      }
      this.setData({
        icons,
        ideaIconRecordList: app.resourceManager.ideaIconRecordList
      })
      // 各自的构造
      this[funcName](type, payload)
    } else {
      console.log(`构造函数[${funcName}]不存在`)
      wx.showToast({
        title: '喂！再往前就是地狱啊',
        icon: 'none'
      })
    }
  },
  loadEdit (type, { _id, title, description, markerIcon }) {
    markerIcon = Number(markerIcon)
    const markerIconIndex = app.resourceManager.ideaIconRecordList.findIndex(it => it.id === markerIcon)
    this.setData({
      type,
      _id,
      title,
      description,
      markerIconIndex
    })
  },
  loadCreate (type, payload) {
    this.setData({
      type
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (querys) {
    const type = querys.type
    delete querys.type
    this.constructor(type, querys)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
