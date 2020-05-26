const db = wx.cloud.database()

class IdeaManager {
  constructor (app) {
    this.app = app
    this.ideaImgPath = {}
    // ideaMap 里存放着映射 id => idea，这个映射的构建在 event setIdeas 时完成
    // 绘制 polyline 想法关联需要使用这个映射，因此绘制动作可以发生在 ideaMap 更新之后
    this.ideaMap = new Map()
    // debug
    // wx.ideaMng = this
    // 图标id到云存储file记录的映射
    this.iconFileRecord = {}
    // 默认图标id
    this.defaultIconId = null
    this.getIdeaImageList()
  }

  getIdeaImageList () {
    // 查询云数据库中存在多少可选的Idea的图像, 并逐个下载缓存
    db.collection('StaticResource').where({
      type: 'ideaIcon'
    }).get().then(res => {
      const ideaIconList = res.data
      if (ideaIconList.length <= 0) {
        return
      }
      this.defaultIconId = ideaIconList[1]._id
      for (let i = 0; i < ideaIconList.length; i++) {
        const fileId = ideaIconList[i].fileId
        this.iconFileRecord[Number(ideaIconList[i]._id)] = ideaIconList[i]
        wx.cloud.downloadFile({ fileID: fileId }).then(res => {
          if (res.statusCode === 200) {
            this.ideaImgPath[fileId] = res.tempFilePath
          }
        }).catch()
      }
      console.log(this.iconFileRecord)
    }).catch()
  }

  getIdeaImageList () {
    // 查询云数据库中存在多少可选的Idea的图像, 并逐个下载缓存
    db.collection('StaticResource').where({
      type: 'ideaIcon'
    }).get().then(res => {
      const ideaIconList = res.data
      if (ideaIconList.length <= 0) {
        return
      }
      this.defaultIconId = ideaIconList[1]._id
      for (let i = 0; i < ideaIconList.length; i++) {
        const fileId = ideaIconList[i].fileId
        this.iconFileRecord[Number(ideaIconList[i]._id)] = ideaIconList[i]
        wx.cloud.downloadFile({ fileID: fileId }).then(res => {
          if (res.statusCode === 200) {
            this.ideaImgPath[fileId] = res.tempFilePath
          }
        }).catch()
      }
      console.log(this.iconFileRecord)
    }).catch()
  }

  async createIdea (title, description, markerIcon, latitude, longitude) {
    let res = []
    let domainId = -1
    try {
      const currentTime = new Date().getTime() // 单位为ms

      // 获取当前位置的domain
      const domain = await this.app.domainMng.getLocalDomain({
        latitude,
        longitude
      })
      domainId = domain.domainId

      // 创建新的想法
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
            markerIcon // 传入的 markerIcon
          },
          key: this.app.globalData.backendKey,
          backendHost: this.app.globalData.backendHost,
          domain_id: domainId
        }
      })
      console.log(res)
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
    res = await this.app.domainMng.getDomainContains({
      domain_id: domainId
    })
  }

  async getIdeaImage (markerIconId) {
    // 输入的参数是 图标id
    // 通过图标id 找到 对应的文件id, 然后看是否有对应文件id的缓存, 如果有, 直接返回
    // 没有下载文件, 再更新缓存
    let fileId = null
    if (!this.iconFileRecord[markerIconId]) {
      // 没有查到图标id, 查询云数据库是否有这个图标id对应的文件记录
      try {
        let res = await db.collection('StaticResource').doc(String(markerIconId)).get()
        const resIcon = res.data
        this.iconFileRecord[Number(resIcon._id)] = resIcon
        const fileId = resIcon.fileId
        res = await wx.cloud.downloadFile({ fileID: fileId })
        if (res.statusCode === 200) {
          this.ideaImgPath[fileId] = res.tempFilePath
          return res.tempFilePath
        }
        throw Error('下载图标文件失败')
      } catch (err) {
        wx.showToast({
          title: '获取图标文件失败',
          icon: 'none',
          duration: 2000
        })
        console.log(err)
        return this.ideaImgPath[this.iconFileRecord[this.defaultIconId].fileId]
      }
    }

    fileId = this.iconFileRecord[markerIconId].fileId

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
