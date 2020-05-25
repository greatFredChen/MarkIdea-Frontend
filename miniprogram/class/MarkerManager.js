class MarkerManager {
  constructor () {
    this.markerImgPath = {}
    this.markerImagePath = {}
  }

  async getMarkerImage (fileId) {
    // 获取图片路径, 不存在则请求云存储
    // console.log('fileId')
    // console.log(fileId)
    if (this.markerImgPath[fileId]) {
      console.log('marker img cache hit')
      return this.markerImgPath[fileId]
    }
    try {
      const res = await wx.cloud.downloadFile({ fileID: fileId })
      // console.log('res')
      // console.log(res)
      if (res.statusCode !== 200) {
        throw res
      }
      this.markerImgPath[fileId] = res.tempFilePath
      return res.tempFilePath
    } catch (e) {
      // console.log('err')
      // console.log(e)
      wx.showToast({
        title: '获取marker图标失败',
        icon: 'none',
        duration: 2000
      })
    }
  }
}

export { MarkerManager }
