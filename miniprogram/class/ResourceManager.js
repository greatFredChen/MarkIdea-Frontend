const db = wx.cloud.database()

class ResourceManager {
  // 资源管理器: 管理下载的云存储资源
  constructor () {
    // 资源id到云存储对应描述的映射
    this.resourceRecord = new Map()
    // 下载并缓存marker图标
    this.ideaIconRecordList = []
    this._downloadAllIdeaIcons()
  }

  /**
   * 根据资源的id获取对应的临时文件路径, 会抛出找不到资源的异常
   * 通过资源id 找到 对应的文件id, 然后看是否有本地对应文件id的缓存, 如果有, 直接返回, 没有则尝试下载
   * @param {String or Number} resourceId  想法图标id, 可以是数字也可以是string
   */
  async getResource (resourceId) {
    resourceId = Number(resourceId)
    if (this.resourceRecord.has(resourceId)) {
      // console.log('idea img cache hit')
      return this.resourceRecord.get(resourceId).tempFilePath
    }
    // 没有查到资源id, 查询云数据库是否有这个id对应的文件记录
    try {
      let res = await db.collection('StaticResource').where(
        String(resourceId)
      ).get()
      let record = res.data
      const recordId = Number(record._id)
      this.resourceRecord.set(recordId, record)
      res = await wx.cloud.downloadFile({ fileID: record.fileId })
      if (res.statusCode === 200) {
        record = this.resourceRecord.get(recordId)
        record.tempFilePath = res.tempFilePath
        return res.tempFilePath
      }
      throw Error('下载资源文件失败:' + record.fileId)
    } catch (err) {
      console.log('获取资源文件失败:' + resourceId)
      console.log(err)
      throw err
    }
  }

  /**
   * 下载并缓存marker图标
   * 查询云数据库中存在多少可选的Idea的图标, 并逐个下载缓存
   */
  _downloadAllIdeaIcons () {
    db.collection('StaticResource').where({
      type: 'ideaIcon'
    }).get().then(res => {
      const ideaIconList = res.data
      if (ideaIconList.length <= 0) {
        return
      }
      for (let i = 0; i < ideaIconList.length; i++) {
        let ideaIconRecord = ideaIconList[i]
        const id = Number(ideaIconRecord._id)
        ideaIconRecord.id = id
        const fileId = ideaIconRecord.fileId
        this.ideaIconRecordList.push(ideaIconRecord)
        this.resourceRecord.set(id, ideaIconRecord)
        wx.cloud.downloadFile({ fileID: fileId }).then(res => {
          if (res.statusCode === 200) {
            ideaIconRecord = this.resourceRecord.get(id)
            ideaIconRecord.tempFilePath = res.tempFilePath
          }
        }).catch()
      }
    }).catch()
  }
}

export { ResourceManager }
