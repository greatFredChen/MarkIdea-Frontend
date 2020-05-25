// components/wedeaMap/wedeaMap.js
import { IdeaManager } from '../../class/IdeaManager'

const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    longitude: 113.0,
    latitude: 22.0,
    scale: 15,
    setting: {
      subkey: '',
    },
    polyline: [],
    markers: [],
    showCrossImage: false,
    region: {
      sw: '',
      ne: ''
    },
    domain_id: -1
  },

  /**
   * s生命周期
   */
  lifetimes: {
    async attached () {
      // 设置地图key
      this.setData({
        setting: {
          subkey: app.globalData.qqmapKey,
        }
      })

      // 获取用户坐标
      await this.getUserLocation()

      // 获取视野范围
      const mapInstance = wx.createMapContext('testmap', this)

      app.ideaMng = new IdeaManager(app, mapInstance)

      mapInstance.getRegion({
        success: (res) => {
          this.setData({
            region: {
              sw: res.southwest,
              ne: res.northeast
            }
          })
        }
      })

      app.event.on('setCrossImage', (showCrossImage) => {
        this.setData({
          showCrossImage
        })
      })

      app.event.on('setMarkers', (markers) => {
        // marker 点击事件回调会返回此 id。建议为每个 marker 设置上 number 类型 id，保证更新 marker 时有更好的性能。
        // 人话：如果没有 id，bindmarkertap 就不会被触发
        markers.map((marker) => {
          marker.id = Number(marker._id)
          return marker
        })
        this.setData({
          markers
        })
      })

      app.event.on('deleteMarker', (ideaId) => {
        // 删除marker中某个指定id的marker
        ideaId = Number(ideaId)
        const markers = this.data.markers
        // console.log('before')
        // console.log(markers)
        for (let i = 0; i < markers.length; i++) {
          if (markers[i].id === ideaId) {
            markers.splice(i, 1)
            break
          }
        }
        // console.log('after')
        // console.log(markers)
        this.setData({ markers })
      })

      app.event.on('getCenterRequest', (res) => {
        app.event.emit('getCenter', {
          latitude: this.data.latitude,
          longitude: this.data.longitude,
          scale: this.data.scale
        })
      })

      app.event.on('SingleIdeaUpdate', ({ _id, title, description }) => {
        console.log(_id, title, description)
        const markers = this.data.markers
        const single = markers.find(i => i._id === _id)
        console.log(single, markers)
        single.title = title
        single.description = description
        this.setData({
          markers
        })
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取用户本地地址，异步
    getUserLocation: async function () {
      // 获取用户坐标
      return new Promise((resolve, reject) => {
        wx.getLocation({
          type: 'gcj02'
        }).then(res => {
          this.setData({
            longitude: res.longitude,
            latitude: res.latitude
          })
          resolve(true)
        }).catch(err => {
          wx.showToast({
            title: '获取用户位置失败',
            icon: 'none',
            duration: 2000
          })
          console.log(err)
          reject(err)
        })
      })
    },

    // 点击marker触发事件 修改想法
    markertap: function (e) {
      // TODO: 查看marker信息以及修改marker信息
      app.event.emit('viewIdea', e.detail.markerId)
    },
    // 移动地图触发
    regionchange: function (e) {
      const mapInstance = wx.createMapContext('testmap', this)
      if (e.causedBy === 'scale' && e.type === 'end') {
        // 缩放完成
        const markers = this.data.markers
        mapInstance.getScale({
          success: (res) => {
            const scale = res.scale
            for (const m of markers) {
              m.height = m.width = app.ideaMng.suitWH(m.likes, scale)
            }
            this.setData({
              markers: markers
            })
          }

        })
      }
      // 获取地图中心坐标
      // console.log(mapInstance)
      mapInstance.getCenterLocation({
        success: (res) => {
          const latitude = res.latitude
          const longitude = res.longitude
          if (this.data.latitude !== latitude || this.data.longitude !== longitude) {
            console.log(latitude, longitude)
            this.setData({
              latitude: latitude,
              longitude: longitude
            })
          }
        }
      })
    }
  }
})
