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
    ideaIconRecordList: [], // for view getter
    latitude: -1, // 地图中心纬度
    longitude: -1 // 地图中心经度
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
  enterCreate () { // 创建页面中按下确定按钮
    const pck = this.getPackage()
    app.event.emit('createIdeaMiddleman', pck)
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
    // b. loadEdit()                        [package in args    set]           [o]                [edit]
    // c. event viewIdeaLocalUpdate         [package in package set] [warning] [m]                [noedit]
    // d. event singleIdeaUpdate            [package in args    set]           [n]                [edit]
    // _. event createIdeaMiddleman         [package in package out]           [j]                [noedit]
    // e. ideaManager::ideaEdit             [package in package net] [warning] [h]                [noedit]  [delete]
    // f. enterCreate                       [package in package out]           [_]                [noedit]
    // g. enterEdit                         [package in package out]           [c, d, **e**, p]   [noedit]
    // h. cloudFunction ideaEdit            [net     in args    out]                              [edit]
    // j. createPanel::createIdeaMiddleman  [package in args    out]           [k]                [edit]
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
      // wx.navigateBack()
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
    app.event.on('closeEdit', () => {
      wx.navigateBack()
    })
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
