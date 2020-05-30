const app = getApp()

class Idea {
  /**
   * idea对象构造函数, 目前系统管理只需这些参数, 查看详情页面等多余的参数可以请求数据库
   * 请确保这些参数都被正确赋值
   * @param {String or Number} id
   * @param {String} title
   * @param {Number} markerIcon
   * @param {Number} latitude
   * @param {Number} longitude
   */
  constructor (properties) {
    for (const key in properties) {
      this[key] = properties[key]
    }
    if (this.id) {
      this.id = Number(this.id)
    } else {
      this.id = Number(this._id)
    }
    this.markerIcon = Number(this.markerIcon)
  }

  /**
   * 获取图像, 如果有则直接返回, 没有则像资源管理器查询该idea对象拥有的图像路径
   */
  async getImage () {
    if (!this.iconPath) {
      this.iconPath = await app.resourceManager.getResource(this.markerIcon)
    }
    return this.iconPath
  }

  /**
   * 请求云函数对idea对象进行编辑更新
   * 目前支持参数如下:
   * @param {*} param
   * {
   *    title
   *    description
   *    items
   *    markerIcon
   * }
   */
  async edit (param) {
    // 还需要更多可拓展性的操作
    let iconPath = null
    try {
      const res = await wx.cloud.callFunction({
        name: 'ideaEdit',
        data: {
          $url: 'ideaEdit',
          title: param.title,
          description: param.description,
          markerIcon: param.markerIcon,
          items: param.items,
          _id: String(this.id)
        }
      })
      if (res.result.code !== 0) {
        throw res
      }
      iconPath = await app.resourceManager.getResource(param.markerIcon)
    } catch (err) {
      throw Error({
        msg: '想法编辑失败',
        error: err
      })
    }
    this.markerIcon = param.markerIcon
    this.title = param.title
    this.items = param.items
    this.description = param.escription
    this.iconPath = iconPath
    // 通知map组件更新单个Idea信息
    // TODO: 以后不仅传title, 还会传其他参数
    app.event.emit('singleIdeaUpdate', {
      _id: this._id,
      title: this.title,
      iconPath: iconPath
    })
  }
}
export {
  Idea
}
