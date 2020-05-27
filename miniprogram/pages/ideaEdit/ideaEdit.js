// miniprogram/pages/ideaEdit/ideaEdit.js
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
    markerIcon: -1,
    icons: [],
    iconFileRecord: {},
    ideaImgPath: {},
    latitude: -1, // 地图中心纬度
    longitude: -1 // 地图中心经度
  },
  bindPickerChange (e) {
    this.setData({
      markerIcon: this.data.icons[Number(e.detail.value)].id
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
  enterCreate () {
    app.event.emit('createIdeaMiddleman', {
      title: this.data.title,
      description: this.data.description,
      markerIcon: this.data.markerIcon
    })
  },
  async enterEdit () {
    try {
      wx.showLoading({
        title: '发送电波中...'
      })
      const res = await app.ideaMng.ideaEdit(this.data._id, this.data.title, this.data.description)
      // console.log(res)
      if (res.result.code !== 0) {
        throw res
      }
      app.event.emit('singleIdeaUpdate', {
        _id: this.data._id,
        title: this.data.title,
        description: this.data.description
      })
      app.event.emit('viewIdeaLocalUpdate', {
        title: this.data.title,
        description: this.data.description
      })
      wx.hideLoading()
      wx.showToast()
    } catch (err) {
      console.log(err)
      wx.hideLoading()
      wx.showToast({
        title: '编辑失败',
        icon: 'none'
      })
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
      for (const [id, value] of Object.entries(app.ideaMng.iconFileRecord)) {
        icons.push({
          id,
          name: value.name
        })
      }
      this.setData({
        icons,
        ideaImgPath: app.ideaMng.ideaImgPath,
        iconFileRecord: app.ideaMng.iconFileRecord
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
  loadEdit (type, { _id, title, description }) {
    this.setData({
      type,
      _id,
      title,
      description
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
