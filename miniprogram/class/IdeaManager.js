
class IdeaManager {
  constructor (app, map) {
    this.app = app
    this.map = map
    this.ideaImgPath = {}
  }

  async createIdea (title, description) {
    let res = []
    let domainId = -1
    try {
      const currentTime = new Date().getTime() // 单位为ms
      const {
        latitude,
        longitude
      } = await this.map.getCenterLocation()

      // 获取当前位置的domain_id
      await wx.cloud.callFunction({
        name: 'getLocalDomain',
        data: {
          latitude: latitude,
          longitude: longitude,
          key: this.app.globalData.qqmapKey,
          create_domain: true,
          backend_host: this.app.globalData.backendHost,
          backend_key: this.app.globalData.backendKey
        }
      }).then(res => {
        if (res.result.code === 201 || res.result.code === 200) {
          domainId = res.result.domainId
        } else {
          throw new Error()
        }
      }).catch(err => {
        wx.showToast({
          title: '获取domain_id失败',
          icon: 'none',
          duration: 2000
        })
        console.log(err)
      })

      res = await wx.cloud.callFunction({
        name: 'createIdea',
        data: {
          idea: {
            latitude: latitude,
            longitude: longitude,
            author_id: this.app.globalData.openid,
            title: title,
            created_at: currentTime,
            likes: 0,
            description: description,
            // 云存储中的fileId
            markerIcon: 'cloud://map-test-859my.6d61-map-test-859my-1302041669/marker.png'
          },
          key: this.app.globalData.backendKey,
          backendHost: this.app.globalData.backendHost,
          domain_id: domainId
        }
      })
      if (res.result.code !== 201) {
        throw res
      }
    } catch (e) {
      wx.showToast({
        title: '创建失败',
        icon: 'none',
        duration: 2000
      })
      console.log(e)
    }

    // 创建动作完成后，无论成不成功，都要获取当前地区的所有Idea
    let ideas = []
    await wx.cloud.callFunction({
      name: 'getDomainContains',
      data: {
        domain_id: domainId,
        backend_host: this.app.globalData.backendHost
      }
    }).then(res => {
      if (res.result.code === 200) {
        ideas = res.result.idea
      } else {
        throw new Error()
      }
    }).catch(err => {
      wx.showToast({
        title: '获取想法失败',
        icon: 'none',
        duration: 2000
      })
      console.log(err)
    })

    // 成功完成整个插入过程
    return ideas
  }

  async getIdeaImage (fileId) {
    // 获取图片路径, 不存在则请求云存储
    // console.log('fileId')
    // console.log(fileId)
    if (this.ideaImgPath[fileId]) {
      // console.log('idea img cache hit')
      return this.ideaImgPath[fileId]
    }
    try {
      const res = await wx.cloud.downloadFile({ fileID: fileId })
      // console.log('res')
      // console.log(res)
      if (res.statusCode !== 200) {
        throw res
      }
      this.ideaImgPath[fileId] = res.tempFilePath
      return res.tempFilePath
    } catch (e) {
      console.log('获取想法图标失败')
      console.log(e)
      return 'cloud://map-test-859my.6d61-map-test-859my-1302041669/marker.png'
    }
  }

  ideaEdit (_id, title, description) {
    return wx.cloud.callFunction({
      name: 'ideaEdit',
      data: {
        $url: 'ideaEdit',
        title,
        description,
        _id
      }
    })
  }
}

export { IdeaManager }
