class DomainManager {
  constructor (app) {
    this.app = app
  }

  // 获取当前地图中心的domain
  /**
   * 参数: event
   * {
   *  latitude 纬度
   *  longitude 经度
   * }
   */
  async getLocalDomain (event) {
    // 获取当前中心对应的domain_id
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getLocalDomain',
        data: {
          latitude: event.latitude,
          longitude: event.longitude,
          key: this.app.globalData.qqmapKey,
          create_domain: true,
          backend_host: this.app.globalData.backendHost,
          backend_key: this.app.globalData.backendKey
        }
      }).then(res => {
        if (res.result.code === 201 || res.result.code === 200) {
          resolve(res.result.domain)
        } else {
          throw new Error(res.result.msg)
        }
      }).catch(err => {
        wx.showToast({
          title: '获取domain_id失败',
          icon: 'none',
          duration: 2000
        })
        reject(err)
      })
    })
  }

  /**
   * 获取domain中对应Idea和Relationship
   * 参数: event
   * {
   *  domain_id
   * }
   */
  async getDomainContains (event) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getDomainContains',
        data: {
          domain_id: event.domain_id,
          backend_host: this.app.globalData.backendHost
        }
      }).then(async res => {
        if (res.result.code === 200) {
          this.app.event.emit('setIdeas', { ideas: res.result.idea, relationship: res.result.relationship })
          resolve(res.result)
        } else {
          throw new Error(res.result.msg)
        }
      }).catch(err => {
        wx.showToast({
          title: '获取想法失败',
          icon: 'none',
          duration: 2000
        })
        this.app.event.emit('setIdeas', { ideas: [], relationship: [] })
        reject(err)
      })
    })
  }
}

export { DomainManager }
