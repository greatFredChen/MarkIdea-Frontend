// miniprogram/pages/ideaEdit/ideaEdit.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    description: '',
    inEditPreview: 0,
    _id: -1
  },
  bindtap (e) {
    this.setData({
      inEditPreview: Number(e.currentTarget.id)
    })
  },
  bindEditUpdate (pck) {
    this.setData(pck.detail)
  },
  async enter () {
    try {
      wx.showLoading({
        title: '发送电波中...'
      })
      await wx.cloud.callFunction({
        name: 'ideaEdit',
        data: {
          $url: 'ideaEdit',
          title: this.data.title,
          description: this.data.description,
          _id: this.data._id
        }
      })
      app.event.emit('SingleIdeaUpdate', {
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({ _id, title, description }) {
    this.setData({
      _id,
      title,
      description
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
