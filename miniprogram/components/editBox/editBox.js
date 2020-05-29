// components/editBox/editBox.js
import { IdeaType, MediaType, ItemType } from '../../class/IdeaType'
import { uuid, formatTime } from '../../utils/util'
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
    titleCount: 0,
    desCount: 0,
    showActionsheet: false,
    actionGroups: [],
    ItemType: new ItemType(),
    MediaType: new MediaType()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindinput (e) {
      const pck = {}
      pck[e.currentTarget.id] = e.detail.value
      this.triggerEvent('editUpdate', pck)
      // 编辑产生的长度设置
      if (e.currentTarget.id === 'description') {
        this.setData({
          desCount: e.detail.value.length
        })
      }
      if (e.currentTarget.id === 'title') {
        if (e.detail.value.length === 0) {
          this.setData({
            titleCount: e.detail.value.length
          })
        }
      }
    },
    enter () {
      this.triggerEvent('enter')
    },
    openChoseSheet () {
      this.setData({
        showActionsheet: true
      })
    },
    closeChoseSheet () {
      this.setData({
        showActionsheet: false
      })
    },
    choseMediaType (e) {
      const type = e.detail.value
      console.log(e)
      const item = new ItemType(type)
      this.properties.items.push(item)
      this.setData({ items: this.properties.items })
      console.log(this.properties.items)
      this.closeChoseSheet()
    },
    async uploadFile () {
      for (const i of this.properties.items) {
        const tempFilePath = i.src
        const timestr = formatTime(new Date()).replace(/[ /:]/gi, '-')
        const cloudPath = 'picture/' + timestr + '-' + uuid() + tempFilePath.split('.').pop()
        console.log(cloudPath)
        const upres = await wx.cloud.uploadFile({
          cloudPath,
          filePath: tempFilePath
        })
        i.src = upres.fileID
      }
    },
    async choseFile (e) {
      console.log(e)
      try {
        const res = await wx.chooseImage({
          sizeType: ['original', 'compressed'],
          sourceType: ['album', 'camera'],
          count: 1
        })
        this.properties.items[e.currentTarget.id].src = res.tempFilePaths[0]
        this.setData({
          items: this.properties.items
        })
      } catch (err) {
        console.log(err)
        if (err.errMsg === 'chooseImage:fail cancel') {
          // do nothing
        }
      }
    }
  },
  observers: {
    // 初次传值的长度设置
    title (title) {
      this.setData({
        titleCount: title.length
      })
    },
    description (description) {
      this.setData({
        desCount: description.length
      })
    }
  },
  lifetimes: {
    attached () {
      const groups = []
      for (const idx in this.data.MediaType) {
        groups.push({
          text: this.data.MediaType[idx],
          value: this.data.MediaType[idx]
        })
      }
      this.setData({
        actionGroups: groups
      })
    }
  }
})
