const app = getApp()

class Domain {
  constructor (id) {
    // id: domain对应的id
    this.id = Number(id)
  }

  /**
   * 获取domain中对应Idea和Relationship
   */
  async getContains () {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getDomainContains',
        data: {
          domain_id: this.id,
          backend_host: app.globalData.backendHost
        }
      }).then(async res => {
        if (res.result.code === 200) {
          resolve({
            ideas: res.result.idea,
            relationships: res.result.relationship
          })
        } else {
          throw new Error(res.result.msg)
        }
      }).catch(err => {
        wx.showToast({
          title: '获取想法失败',
          icon: 'none',
          duration: 2000
        })
        reject(err)
      })
    })
  }
}

export { Domain }
