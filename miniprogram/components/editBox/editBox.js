// components/editBox/editBox.js
import { IdeaType, MediaType, ItemType } from '../../class/IdeaType'
import { uuid, formatTime } from '../../utils/util'
const CLOUDFILEHEAD = 'cloud://'
const app = getApp()
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
    async enter () {
      wx.showLoading({
        title: '保存中',
        mask: true
      })
      try {
        await this.uploadFile()
        console.log(this.properties)
        app.event.emit('setItems', this.properties.items)
        this.triggerEvent('enter')
      } catch (err) {
        console.log(err)
        wx.hideLoading()
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
      }
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
        if (i.src.startsWith(CLOUDFILEHEAD)) {
          // 不上传 fileID
          continue
        }
        if (i.type === this.properties.MediaType.MARKDOWN || i.type === this.properties.MediaType.LINK) {
          // 不上传文本和链接
          continue
        }
        const tempFilePath = i.src
        const timestr = formatTime(new Date()).replace(/[ /:]/gi, '-')
        const cloudPath = 'picture/' + timestr + '-' + uuid() + '.' + tempFilePath.split('.').pop()
        console.log(cloudPath)
        const upres = await wx.cloud.uploadFile({
          cloudPath,
          filePath: tempFilePath
        })
        i.src = upres.fileID
      }
      this.setData({
        items: this.properties.items
      })
      console.log(this.properties.items)
      console.log('文件上传完毕')
    },
    async chooseImage (idx) {
      try {
        const res = await wx.chooseImage({
          sizeType: ['original', 'compressed'],
          sourceType: ['album', 'camera'],
          count: 1
        })
        this.properties.items[idx].src = res.tempFilePaths[0]
        this.setData({
          items: this.properties.items
        })
      } catch (err) {
        console.log(err)
        if (err.errMsg === 'chooseImage:fail cancel') {
          // do nothing
        } else {
          wx.wx.showToast({
            title: '获取图片失败',
            icon: 'none'
          })
        }
      }
    },
    async chooseMessageFile (idx) {
      // 微信仅允许获取聊天内容文件
      try {
        const res = await wx.chooseMessageFile({
          count: 1,
          type: 'file'
        })
        console.log(res)
        const tempFilePath = res.tempFiles[0].path
        this.properties.items[idx].src = tempFilePath
        this.setData({
          items: this.properties.items
        })
      } catch (err) {
        console.log(err)
      }
    },
    async chooseFile (e) {
      console.log(e)
      const idx = Number(e.currentTarget.id)
      if (this.properties.items[idx].type === this.properties.MediaType.PICTURE) {
        await this.chooseImage(idx)
      } else {
        await this.chooseMessageFile(idx)
      }
    },
    async deleteItem (e) {
      console.log(e)
      const idx = Number(e.currentTarget.id)
      this.properties.items.splice(idx, 1)
      this.setData({
        items: this.properties.items
      })
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
