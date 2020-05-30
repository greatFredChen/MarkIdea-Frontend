import { CLOUD_FILE_HEAD, MAX_FETCH_URL_COUNT } from './Constants'
import { MediaType } from './IdeaType'
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

  /**
   * 将想法子项中的 cloudID 替换成 tempUrl
   * @param {*} items 想法子项
   * @returns itemId2SwapSrc itemId 到 tempUrl 的映射
   */
  static async replaceCloudID2TempUrl (items) {
    // 初始化非 markdown 类想法子项 idea 备份
    // 获取 coudId 到 uuid _d 的映射
    const cloudId2uuid = new Map()
    for (const i of items) {
      if (i.src.startsWith(CLOUD_FILE_HEAD)) {
        cloudId2uuid.set(i.src, i._id)
      }
    }
    // 获取分割的 cloudID list
    // getTempUrl 每次最多获取 MAX_FETCH_URL_COUNT 个文件 url
    const MARKDOWN = (new MediaType()).MARKDOWN
    const tmpList = items.filter(item => item.type !== MARKDOWN)
    const fetchList = []
    const oneTimeFetchList = []
    let cnt = 0
    for (const i in tmpList) {
      if (cnt === MAX_FETCH_URL_COUNT) {
        fetchList.push(oneTimeFetchList)
        oneTimeFetchList.length = 0
        cnt = 0
      }
      oneTimeFetchList.push(tmpList[i].src)
    }
    if (oneTimeFetchList.length !== 0) {
      fetchList.push(oneTimeFetchList)
    }
    // 设置 uuid 到 换取的src 的映射
    const itemId2SwapSrc = new Map()
    for (const i of fetchList) {
      try {
        const res = await wx.cloud.getTempFileURL({
          fileList: i
        })
        for (const j of res.fileList) {
          itemId2SwapSrc.set(cloudId2uuid.get(j.fileID), j.tempFileURL)
        }
      } catch (err) {
        console.log(err)
      }
    }
    // 将 换取的src 设置到 items 上
    for (const i of items) {
      if (itemId2SwapSrc.has(i._id)) {
        i.src = itemId2SwapSrc.get(i._id)
      }
    }
    return itemId2SwapSrc
  }
}
export {
  Idea
}
