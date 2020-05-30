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
  },
  methods: {
    openImage (e) {
      const idx = Number(e.currentTarget.id)
      wx.previewImage({
        urls: [this.properties.items[idx].src]
      })
    }
  }
})
