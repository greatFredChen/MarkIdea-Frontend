class IdeaManager {
  constructor (app, map) {
    this.app = app
    this.map = map
  }

  async createIdea (e) {
    let res = []
    let scale = 15
    try {
      const currentTime = new Date().getTime() // 单位为ms
      const pck = await this.map.getScale()
      scale = pck.scale
      const {
        latitude,
        longitude
      } = await this.map.getCenterLocation()
      const marker = {
        latitude: latitude,
        longitude: longitude,
        iconPath: '/images/marker.png', // 默认的图标不能放大
        author_id: this.app.globalData.openid,
        title: e.detail.title_input,
        created_at: currentTime,
        likes: 0,
        description: e.detail.description_input,
        width: this.suitWH(0, scale),
        height: this.suitWH(0, scale)
      }
      res = await wx.cloud.callFunction({
        name: 'createIdea',
        data: {
          marker: marker
        }
      })
      if (res.result.code === -1) {
        throw new Error()
      }
    } catch (e) {
      wx.showToast({
        title: '创建失败',
        icon: 'none',
        duration: 2000
      })
      console.log(e)
      // 返回原来的marker数组
      return this.addMarkerAttr(res.result.markers, scale)
    }

    // 成功完成整个插入过程
    return this.addMarkerAttr(res.result.markers, scale)
  }

  // 为marker增加属性
  addMarkerAttr (markers, scale) {
    for (let i = 0; i < markers.length; i++) {
      markers[i].iconPath = '/images/marker.png'
      markers[i].width = this.suitWH(markers[i].likes, scale)
      markers[i].height = this.suitWH(markers[i].likes, scale)
    }
    return markers
  }

  suitWH (cnt, scale) {
    const base = 40.0
    const scaleBase = 20.0
    // const iter = Math.log10;
    const iter = (i) => Math.max(1, i)
    return iter(cnt) * base * scale * scale / scaleBase / scaleBase
  }
}

export { IdeaManager }
