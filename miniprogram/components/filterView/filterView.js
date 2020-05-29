// components/filterView/filterView.js
/**
 * 过滤器配置组件
 */
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
    show: false, // 展示 ideaView
    filterItemList: null,
    // 为了点击应用按钮后才生效, 先缓存
    filterItemCache: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    itemInput (event) {
      const detail = event.detail
      this.data.filterItemCache[detail.itemId][detail.key] = detail[detail.key]
    },
    getNumOrNull (obj) {
      if (obj) {
        const num = Number(obj)
        return isNaN(num) ? null : num
      }
      if (obj === 0) { return 0 }
      return null
    },
    tapApply () {
      for (let i = 0; i < this.data.filterItemList.length; i++) {
        const config = this.data.filterItemList[i]
        const cache = this.data.filterItemCache[i]
        if (config.type === 'Number') {
          config.min = this.getNumOrNull(cache.min)
          config.max = this.getNumOrNull(cache.max)
        }
      }
      app.event.emit('updateGraph')
      this.close()
    },
    close () {
      this.setData({
        show: false
      })
    }
  },
  lifetimes: {
    attached () {
      app.event.on('showFilterView', () => {
        this.setData({ show: true })
        app.event.emit('menuButtonStatus', false)
        // 晚更新, 因为attach时ideaManager可能没有初始化
        const filterItemList = []
        const filterItemCache = []
        app.ideaManager.filter.configMap.forEach((value, key, mapObj) => {
          const cache = {
            type: value.type,
            fieldName: value.fieldName,
            itemId: filterItemCache.length
          }
          if (value.type === 'Number') {
            cache.min = value.min
            cache.max = value.max
          }
          filterItemList.push(value)
          filterItemCache.push(cache)
        })
        this.setData({
          filterItemList,
          filterItemCache
        })
      })
    }
  }
})
