// components/descriptionBox/descriptionBox.js
import { IdeaType, MediaType } from '../../class/IdeaType'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    ...(new IdeaType())
  },

  /**
   * 组件的初始数据
   */
  data: {
    MediaType: new MediaType()
  }
})
