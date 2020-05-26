class IdeaConnectManager {
  constructor (app, map) {
    this.app = app
    this.map = map
  }

  // 创建连接
  /**
   * 参数: event
   * {
   *  from 连接起始想法id
   *  to  连接终点想法id
   *  directional 无向边0 有向边1
   *  type 关系类型
   * }
   */
  async createConnect (event) {
    if (event.type === '') {
      wx.showToast({
        title: '关联关系类型不能为空!',
        icon: 'none',
        duration: 1500
      })
      return
    }
    // 若输入框不为空，则进行连接
    wx.showLoading({
      title: '正在连接中....'
    })
    try {
      const res = await wx.cloud.callFunction({
        name: 'createRelationship',
        data: {
          backendHost: this.app.globalData.backendHost,
          key: this.app.globalData.backendKey,
          from: event.from,
          to: event.to,
          directional: event.directional,
          type: event.type
        }
      })
      if (res.result.code !== 201) {
        throw new Error(res.result.error)
      }
    } catch (err) {
      wx.showToast({
        title: '连接失败',
        icon: 'none',
        duration: 1500
      })
      console.log(err)
    }
    wx.hideLoading()
    this.app.event.emit('hideConnectDialog', true)
  }

  // 画出连接
  drawConnect (relationship) {
    const ret = []
    // 获取引用
    const mp = this.app.ideaMng.ideaMap
    for (const r of relationship) {
      const from = mp.get(Number(r.from))
      const to = mp.get(Number(r.to))
      ret.push({
        points: [
          {
            latitude: from.latitude,
            longitude: from.longitude
          },
          {
            latitude: to.latitude,
            longitude: to.longitude
          }
        ],
        arrowLine: r.directional === 1, // 开发者工具暂时不支持箭头
        color: '#607D8B',
        width: 4
        // color, width, dottedLine, arrowIconPath, borderColor, borderWidth
      })
    }
    return ret
  }
}

export { IdeaConnectManager }
