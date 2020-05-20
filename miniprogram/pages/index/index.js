//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    longitude: 113.0,
    latitude: 22.0,
    scale: 15,
    selectMarkId: -1,
    markers: [],
    circles: '',
    polygons: '',
    polyline: [],
    setting: {
      subkey: 'EEGBZ-6NYWW-6YNR5-OMCQX-H3MJH-ATFFG',
    },
    region: {
      sw: '',
      ne: '',
    },
    sdk_version: '',
    modified: false,
    addtellHidden: true,
    modifiedHidden: true,
    scale: 16,
    creating: false,
  },

  // 点击marker触发事件 修改想法
  markertap: function(e) {
    let that = this
    console.log(e)
    if(that.data.modified == true) {
      that.setData({
        selectMarkId: e.detail.markerId,
        modifiedHidden: false
      })
  }
  },

  // 修改窗口
  tapModifiedButton: function(e) {
    console.log(e)
    const touch = e.detail.index
    if (touch) {
      // 确认
      this.modified_callout()
    } else {
      // 取消
    }
    this.setData({
      modifiedHidden: true,
      modified: false
    })
  },

  // 修改标签
  modified_callout: function() {
    let that = this
    if (that.data.modified == true) {
      let markid = that.data.selectMarkId
      let markers = that.data.markers
      let marker_len = markers.length
      for (let i = 0; i < marker_len; i++) {
        if (markers[i].id == markid) {
          // 设置label
          // markers[i].callout.content = that.data.title_input
          break
        }
      }
      that.setData({
        markers: markers
      })
    }
  },

  // 新建marker窗口
  tapDialogButton (e) {
    console.log(e)
    const touch = e.detail.index
    if (touch == 1 && e.detail.title_input != '') {
      // 确认
      this.place_marker(e)
      this.setData({
        addtellHidden: true
      })
    } else if(touch == 1) {
      // 标题为空
      wx.showToast({
        title: '标题不能为空',
        icon:'none',
        duration: 1000
      })
    } else {
      // 取消按钮
      this.setData({
        addtellHidden: true
      })
    }
  },

  // 修改模式按钮
  pressbutton: function() {
    this.setData({
      modified: true
    })
  },

  // 放置marker label
  place_marker: async function(e) {
    let that = this
    let markers = that.data.markers
    if (that.compareVersion(that.data.sdk_version, "2.9.0")) {
      let scale = await wx.createMapContext('testmap').getScale()
      let marker = {
        latitude: that.data.latitude,
        longitude: that.data.longitude,
        iconPath: '/images/marker.png', // 默认的图标不能放大
        like: 0,
        width: this.suitWH(0, scale.scale),
        height: this.suitWH(0, scale.scale),
        callout: {
          content: e.detail.title_input,
          color: "#000",
          fontSize: 16,
          bgColor: "",
        }
      }
      markers.push(marker)
      that.setData({
        markers: markers
      })
      // TODO: 把marker同步到云端的数据库

      console.log("success! A marker is set.")
      console.log(this.data.markers)
    }
    else {
      // 基础库版本过低
      wx.showToast({
        title: '微信基础库版本过低，请升级微信版本',
        icon: 'none',
        duration: 1500
      })
    }
    
    // 取消掉中间的靶心
    that.setData({
      creating: false
    })
  },

  // 点击发布想法
  createMarker: function() {
    this.setData({
      creating: true
    })
  },

  // 点击选定(创建marker位置)触发
  settleMarker: function(e) {
    // 放置marker label
    this.setData({
      addtellHidden: false,
      modified: false,
      modifiedHidden: true  // 强制取消修改模式
    })
  },

  // 点击取消(创建marker位置)触发
  cancelMarker: function() {
    this.setData({
      creating: false
    })
  },

  // 比较版本号 version1 >= version2时返回true
  compareVersion: function(version1, version2) {
    let v1 = version1.split('.') // array
    let v2 = version2.split('.') // array
    let len = Math.max(v1.length, v2.length)
    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }
    // 比较每一位
    for (let i = 0; i < len; i++) {
      let num1 = parseInt(v1[i])
      let num2 = parseInt(v2[i])
      if (num1 < num2) {
        return false // version1 < version2
      } else if (num1 > num2) {
        return true // version1 > version2
      }
    }
    return true // version1 == version2
  },

  suitWH(cnt, scale) {
    const base = 40.0;
    const scaleBase = 20.0;
    // const iter = Math.log10;
    const iter = (i) => Math.max(1, i)
    return iter(cnt) * base * scale * scale / scaleBase / scaleBase
  },

  bindupdated(e) {
    console.log(e)
  },

  // 移动地图触发
  regionchange: function(e) {
    let that = this
    let mapInstance = wx.createMapContext('testmap')
    if (e.causedBy === 'scale' && e.type === 'end') {
      // 缩放完成
      const markers = this.data.markers
      mapInstance.getScale({
        success(res) {
          console.log(res)
          const scale = res.scale
          for (let m of markers) {
            m.width = that.suitWH(m.like, scale)
            m.height = that.suitWH(m.like, scale)
            console.log(m.width)
          }
          that.setData({
            markers: markers,
          })
        }
      })
    }
    // 获取地图中心坐标
    // console.log(mapInstance)
    mapInstance.getCenterLocation({
      success: function(res) {
        let latitude = res.latitude
        let longitude = res.longitude
        if (that.data.latitude != latitude || that.data.longitude != longitude) {
          console.log(latitude, longitude)
          that.setData({
            latitude: latitude,
            longitude: longitude
          })
        }
      }
    })
  },

  async onLike(e) {
    // 点赞按钮被按下
    const id = e.detail.id
    const markers = this.data.markers;
    const idx = markers.findIndex(obj => obj.id === id)
    if (idx === -1) return -1
    const obj = markers[idx]
    obj.like = obj.like ? obj.like + 1 : 1;
    let scale = await wx.createMapContext('testmap').getScale()
    obj.width = this.suitWH(obj.like, scale.scale)
    obj.height = this.suitWH(obj.like, scale.scale)
    this.setData({
      markers: markers,
    })
    // 下面这种更新失败了
    // const key = `markers[${idx}]`
    // this.setData({
    //   key: obj
    // })
    // console.log(this.data.markers)
  },

  onLink(e) {
    const arr1 = []
    const arr2 = []
    for (let m of this.data.markers) {
      let arr = Math.random() > .5 ? arr1 : arr2
      arr.push({
        latitude: m.latitude,
        longitude: m.longitude
      })
    }
    const polyline = [{
      points: arr1,
      color: "#FF0000DD",
      width: 2,
      dottedLine: true
    }, {
      points: arr2,
      color: "#FF0000DD",
      width: 2,
      dottedLine: true
    }]
    console.log(polyline)
    this.setData({
      polyline: polyline,
    })
  },

  // 加载
  onLoad: function() {
    let that = this
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })

    // 获取用户坐标
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      }
    })

    // 获取视野范围
    let mapInstance = wx.createMapContext("testmap")
    mapInstance.getRegion({
      success: function(res) {
        // console.log("sw coordinate:", res.southwest)
        // console.log("ne coordinate:", res.northeast)
        that.setData({
          region: {
            sw: res.southwest,
            ne: res.northeast,
          }
        })
      }
    })

    // 获取微信用户当前版本号
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sdk_version: res.SDKVersion
        })
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
})