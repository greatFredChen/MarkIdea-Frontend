// components/filterItem/filterItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    filterItem: Object,
    itemId: Number,
    min: Number,
    max: Number
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
    minInput (event) {
      this.triggerEvent('itemInput', {
        key: 'min',
        min: event.detail.value,
        itemId: this.data.itemId
      })
    },
    maxInput (event) {
      this.triggerEvent('itemInput', {
        key: 'max',
        max: event.detail.value,
        itemId: this.data.itemId
      })
    }
  }
})
