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
      subkey: 'EEGBZ-6NYWW-6YNR5-OMCQX-H3MJH-ATFFG'
    },
    polyline: [],
    markers: [],
    showCrossImage: false,
    region: {
      sw: '',
      ne: ''
    },
    domain_id: -1,
  },

  /**
   * s生命周期
   */
  lifetimes: {
    async attached () {
      // 获取用户坐标
      let GL = await this.getUserLocation()

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
        this.setData({
          markers
        })
      })

      app.event.on('getCenterRequest', (res) => {
        app.event.emit('getCenter', {
          latitude: this.data.latitude,
          longitude: this.data.longitude,
          scale: this.data.scale
        })
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取用户本地地址，异步
    getUserLocation: async function() {
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
          reject(false)
        })
      })
    },

    // 点击marker触发事件 修改想法
    markertap: function (e) {
      // TODO: 查看marker信息以及修改marker信息
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
