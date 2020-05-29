import { uuid } from '../utils/util'
/**
 * 媒体类型
 */
class MediaType {
  MARKDOWN = 'MARKDOWN'
  AUDIO = 'AUDIO'
  VIDEO = 'VIDEO'
  PICTURE = 'PICTURE'
  LINK = 'LINK'
}
/**
 * 想法子项类型
 */
class ItemType {
  _id = String
  subTitle = String
  type = MediaType
  src = String
  /**
   * 创建一个想法子项
   * @param {MediaType} type
   */
  constructor (type) {
    if (type === undefined) {
      return
    }
    if (Object.prototype.hasOwnProperty.call(new MediaType(), type)) {
      this.type = type
      this.subTitle = this.subTitle()
      this.src = this.src()
      this._id = uuid()
    }
  }
}
/**
 * 想法类型
 */
class IdeaType {
  title = String
  description = String
  items = Array
  markerIcon = Number
  constructor (isForData) {
    if (isForData === undefined) {
      return
    }
    this.title = this.title() // equ ''
    this.description = this.description() // equ ''
    this.items = this.items() // equ []
    this.markerIcon = this.markerIcon() // equ 0
  }
}

// 如何使用？
// 在 properties 中使用：
// properties: {
//   ...(new ***Type())
// }
export { MediaType, ItemType, IdeaType }
