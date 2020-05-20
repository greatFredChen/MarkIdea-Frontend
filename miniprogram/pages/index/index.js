//index.js
const app = getApp()
// util.js
let util = require('../../utils/util.js')

Page({
  data: {
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
    addtellHidden: true,
    authorizeHidden: true,
    scale: 16,
    creating: false,
  },

  // 点击marker触发事件 修改想法
  markertap: function(e) {
    let that = this
    //TODO: 查看marker信息以及修改marker信息
  },

  // 新建marker模态窗
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

  // 为marker增加属性
  addMarkerAttr: function(markers, scale) {
    for(let i = 0; i < markers.length; i++) {
      markers[i].iconPath = '/images/marker.png'
      markers[i].width = this.suitWH(0, scale.scale)
      markers[i].height = this.suitWH(0, scale.scale)
    }
    return markers
  },

  // 放置marker label
  place_marker: async function(e) {
    let that = this
    let currentTime = new Date().getTime() // 单位为ms
    if (util.compareVersion(that.data.sdk_version, "2.9.0")) {
      let scale = await wx.createMapContext('testmap').getScale()
      let marker = {
        latitude: that.data.latitude,
        longitude: that.data.longitude,
        iconPath: '/images/marker.png', // 默认的图标不能放大
        author_id: app.globalData.openid,
        title: e.detail.title_input,
        created_at: currentTime,
        likes: 0,
        description: e.detail.description_input,
        width: this.suitWH(0, scale.scale),
        height: this.suitWH(0, scale.scale),
      }
      wx.cloud.callFunction({
        name: 'createIdea',
        data: {
          marker: marker
        },
        success: res => {
          let markers = res.result.markers
          markers = that.addMarkerAttr(markers, scale)
          that.setData({
            markers: res.result.markers
          })
        },
        fail: err => {
          wx.showToast({
            title: '同步失败',
            icon: 'none',
            duration: 2000
          })
          console.log(err)
        }
      })
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

  suitWH(cnt, scale) {
    const base = 40.0;
    const scaleBase = 20.0;
    // const iter = Math.log10;
    const iter = (i) => Math.max(1, i)
    return iter(cnt) * base * scale * scale / scaleBase / scaleBase
  },

  bindupdated(e) {
    // console.log(e)
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
          // console.log(res)
          const scale = res.scale
          for (let m of markers) {
            m.width = that.suitWH(m.likes, scale)
            m.height = that.suitWH(m.likes, scale)
            // console.log(m.width)
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
    obj.likes = obj.likes ? obj.likes + 1 : 1;
    let scale = await wx.createMapContext('testmap').getScale()
    obj.width = this.suitWH(obj.likes, scale.scale)
    obj.height = this.suitWH(obj.likes, scale.scale)
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

  // 连线函数
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
  onLoad: async function() {
    let that = this
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 缩放幅度
    let scale = await wx.createMapContext('testmap').getScale()

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

    // 获取当前地图上所有markers
    wx.cloud.callFunction({
      name: 'getIdea',
      data: {},
      success: res => {
        console.log(res.result)
        let markers = res.result.markers
        markers = that.addMarkerAttr(markers, scale)
        that.setData({
          markers: markers
        })
      },
      fail: err => {
        wx.showToast({
          title: '获取markers失败',
          icon: 'none',
          duration: 2000
        })
        console.log(err)
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

     // 获取微信openid
     wx.cloud.callFunction({
      name: 'getOpenId',
      data: {},
      success: res => {
        app.globalData.openid = res.result.openid
      },
      fail: err => {
        wx.showToast({
          title: '获取openid失败',
          icon: 'none',
          duration: 1500
        })
        console.log(err)
      }
    })

    // 若用户已经授权
    wx.getUserInfo({
      success: res => {
        let userInfo = JSON.parse(res.rawData)
        app.globalData.logged = true
        app.globalData.avatarUrl = userInfo.avatarUrl
        app.globalData.userInfo = userInfo
      },
      fail: err => {
        // 若用户没有授权过
        that.setData({
          authorizeHidden: false
        })
      }
    })

  },
  
  // 授权
  getUserInfo: function(e) {
    this.setData({
      authorizeHidden: true,
    })
    app.globalData.logged = e.detail.logged
    app.globalData.avatarUrl = e.detail.avatarUrl
    app.globalData.userInfo = e.detail.userInfo
  }
})