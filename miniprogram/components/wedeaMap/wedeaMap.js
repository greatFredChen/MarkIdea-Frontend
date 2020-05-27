// components/wedeaMap/wedeaMap.js
import { ResourceManager } from '../../class/ResourceManager'
import { IdeaManager } from '../../class/IdeaManager'
import { DomainManager } from '../../class/DomainManager'

const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    linkMode: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    longitude: 113.0, // 初始latiude
    latitude: 22.0, // 初始longitude
    scale: 15,
    setting: {
      subkey: ''
    },
    polyline: [],
    markers: [],
    showCrossImage: false,
    region: {
      sw: '',
      ne: ''
    },
    domain_id: -1,
    centerLatitude: -1,
    centerLongitude: -1
  },

  /**
   * s生命周期
   */
  lifetimes: {
    async attached () {
      // 设置地图key
      console.log('wedeaMap 正在重新初始化')
      this.setData({
        setting: {
          subkey: app.globalData.qqmapKey
        }
      })

      // 获取用户坐标
      await this.getUserLocation()

      // 获取视野范围
      const mapInstance = wx.createMapContext('testmap', this)

      app.ideaManager = new IdeaManager()
      app.domainManager = new DomainManager()
      app.resourceManager = new ResourceManager()

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

      app.event.on('deleteIdea', (ideaId) => {
        // 删除某个指定id的想法
        ideaId = Number(ideaId)
        // 删除对应的marker和polyline, 如果有的话
        const markers = this.data.markers
        const polyline = this.data.polyline
        const markerIndex = markers.findIndex(i => i.id === ideaId)
        if (markerIndex !== -1) {
          markers.splice(markerIndex, 1)
          this.setData({ markers })
        }
        const newPloyline = []
        for (let i = 0; i < polyline.length; ++i) {
          if (polyline[i].from !== ideaId && polyline[i].to !== ideaId) {
            newPloyline.push(polyline[i])
          }
        }
        this.setData({ polyline: newPloyline })
      })

      app.event.on('ideaLikesChange', ({ ideaId, likes }) => {
        // 单个idea点赞数改变事件
        // ideaId: 被改变的Idea的id
        // likes: 改变之后的点赞数
        const idea = app.ideaManager.ideas.get(Number(ideaId))
        idea.likes = likes
        this.updateGraph()
      })

      app.event.on('getCenterRequest', (res) => {
        app.event.emit('getCenter', {
          latitude: this.data.centerLatitude,
          longitude: this.data.centerLongitude
        })
      })

      app.event.on('SingleIdeaUpdate', async ({ _id, title, iconPath }) => {
        // 单独更新一个Idea的信息
        // console.log(_id, title, description)
        const id = Number(_id)
        // console.log(single, ideas)
        // 更新指定idea的title和description
        const markerIndex = this.data.markers.findIndex(i => i.id === id)
        // 更新marker
        if (markerIndex !== -1) {
          this.setData({
            ['markers[' + markerIndex + '].title']: title,
            ['markers[' + markerIndex + '].iconPath']: iconPath
          })
        }
      })

      app.event.on('refreshLocalDomain', async () => {
        // 刷新地图所属地区
        const domain = await app.domainManager.getLocalDomain({
          latitude: this.data.latitude,
          longitude: this.data.longitude
        })
        const res = await domain.getContains()
        app.ideaManager.setGraph(res.ideas, res.relationships, true)
        this.updateGraph()
      })

      app.event.on('setGraph', async (event) => {
        // 更新地图图结构事件, 根据输入的idea对象列表更新本地数据
        // 之前更新过的id仍会留在键值中
        // event:
        // {
        //    ideas: [idea对象列表],
        //    relationships: [关系对象列表],
        //    clear: 布尔, 是否清除之前的数据
        // }
        // idea 点击事件回调会返回此 id。建议为每个 idea 设置上 number 类型 id，保证更新 idea 时有更好的性能。
        // 人话：如果没有 id，bindideatap 就不会被触发
        // console.log('event setGraph')
        // console.log(event)
        app.ideaManager.setGraph(event.ideas, event.relationships, event.clear)
        this.updateGraph()
      })
    },

    hide () {
      console.log('wedeaMap 隐藏')
      // app.event.off('ideaLikesChange')
      // app.event.off('singleIdeaUpdate')
      // app.event.off('getCenterRequest')
      // app.event.off('deleteIdea')
      // app.event.off('setRelationships')
      // app.event.off('updateGraph')
      // app.event.off('setCrossImage')
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

    // 点击想法触发事件 修改想法
    ideatap: function (e) {
      // TODO: 查看想法信息以及修改想法信息
      if (!this.properties.linkMode) {
        app.event.emit('viewIdea', e.detail.markerId)
      } else { // 连接Idea模式
        app.event.emit('hideConnectDialog', false)
        app.event.emit('getToId', e.detail.markerId)
      }
    },

    // 移动地图触发
    regionchange: async function (e) {
      const that = this
      const mapInstance = wx.createMapContext('testmap', this)
      if (e.causedBy === 'scale' && e.type === 'end') {
        // 缩放完成
        mapInstance.getScale({
          success: (res) => {
            that.setData({ sacle: res.scale })
            // 因为除了scale改了, 其他都没改, 所以直接setMarkers即可
            that.setMarkers(that.data.markers)
          }
        })
      }
      // 获取地图中心坐标
      // console.log(mapInstance)
      try {
        const res = await mapInstance.getCenterLocation()
        this.setData({
          centerLatitude: res.latitude,
          centerLongitude: res.longitude
        })
      } catch (e) {
        console.log('获取地图中心点失败！', e)
      }
    },

    /**
     * 设置显示在地图上的markers列表, 这一层会根据rank自动计算真正显示的大小
     * @param {*} markers
     * markers中的每个元素有以下的属性
     * {
     *  id: marker id 相等于对应的节点id, number型, 有更好的性能
     *  title: 标题
     *  longitude: 纬度
     *  latitude: 经度
     *  iconPath: 图标文件地址
     *  rank: marker的重要性, 0到1之间的实数
     *  其余属性见开发文档
     * }
     */
    setMarkers (markers) {
      // console.log('setMarkers')
      // console.log(markers)
      const base = 60.0
      const scaleBase2 = 20.0 * 20.0
      const scale2 = this.data.scale * this.data.scale
      for (let i = 0; i < markers.length; i++) {
        const marker = markers[i]
        marker.height = marker.width = marker.rank * base * scale2 / scaleBase2
      }
      // console.log('one setMarkers')
      // console.log(markers)
      this.setData({ markers })
    },

    /**
     * 根据app.ideaManager中存有的信息更新地图结构, 会调用setMarkers和setPloyline
     */
    async updateGraph () {
      // 根据idea管理器
      // let ideaRemain = this.filter.filter(this.ideas)  // 过滤之后的ideas引用

      // 因为filter未实现, 下面只是模拟filter的返回全集
      const ideaRemain = []
      // for(let i = 0; i < ideaRemainId.length; i++) {
      //   ideaRemain.push(this.ideas[ideaRemainId[i]])
      // }
      app.ideaManager.ideas.forEach((value, key, mapObj) => {
        ideaRemain.push(value)
      })

      const filterIdeaIdSet = new Set()
      const markers = []
      const rank = app.ideaManager.getRank(ideaRemain)
      for (let i = 0; i < ideaRemain.length; i++) {
        const idea = ideaRemain[i]
        filterIdeaIdSet.add(idea.id)
        markers.push({
          id: idea.id,
          title: idea.title,
          longitude: idea.longitude,
          latitude: idea.latitude,
          iconPath: idea.iconPath ? idea.iconPath : await idea.getImage(),
          rank: rank[i]
        })
      }

      const polyline = []
      const ideas = app.ideaManager.ideas
      app.ideaManager.relationships.forEach((value, key, mapObj) => {
        const from = ideas.get(Number(value.from))
        const to = ideas.get(Number(value.to))
        if (filterIdeaIdSet.has(from.id) && filterIdeaIdSet.has(to.id)) {
          polyline.push({
            points: [
              {
                latitude: from.latitude,
                longitude: from.longitude
              },
              {
                latitude: to.latitude,
                longitude: to.longitude
              }
            ],
            arrowLine: value.directional === 1, // 开发者工具暂时不支持箭头
            color: '#607D8B',
            width: 4
            // color, width, dottedLine, arrowIconPath, borderColor, borderWidth
          })
        }
      })
      this.setMarkers(markers)
      this.setData({ polyline })
    },
    maptab () {
      if (this.data.showCrossImage === false) {
        // 在非创建想法时点击地图
        // 模拟点击面板控制按钮
        app.event.emit('menuButtonStatus', false)
      }
    }
  },

  observers: {
    'centerLatitude, centerLongitude': function (centerLatitude, centerLongitude) {
      app.event.emit('getPosition', {
        latitude: centerLatitude,
        longitude: centerLongitude
      })
    }
  }
})
