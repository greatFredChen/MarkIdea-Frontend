// components/IdeaPointer/IdeaPointer.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    idea: Object,
    linkMode: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转到指定想法所在地点, 并显示该想法, 并且自动点开该想法的查看页面
    viewOrConnectIdea: function () {
      const idea = this.properties.idea
      const longitude = idea.longitude
      const latitude = idea.latitude
      if (!longitude || !latitude) {
        wx.showToast({
          title: '我忘了想法在哪了...',
          icon: 'none'
        })
        return
      }
      // 隐藏搜索界面
      app.event.emit('hideSearchView')
      // 向全局ideaManager放置这个idea记录, 并且更新地图显示, 并且过滤器在
      // 该次更新中将不会检查该节点
      const id = app.ideaManager.putIdea(idea)
      app.event.emit('updateGraph', (new Set()).add(id))
      // 移动地图
      app.event.emit('setLocation', {
        longitude: longitude,
        latitude: latitude
      })
      if (!this.properties.linkMode) {
        // 查看指定想法
        app.event.emit('viewIdea', id)
      } else {
        // 连接指定idea
        app.event.emit('hideConnectDialog', false)
        app.event.emit('getToId', id)
      }
    }
  }
})
