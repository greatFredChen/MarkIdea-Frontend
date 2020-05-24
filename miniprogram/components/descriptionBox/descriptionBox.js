// components/descriptionBox/descriptionBox.js
const comi = require('../../comi/comi.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: String,
    description: String,
    attach: Array
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

  },
  attached: function () {
    comi(this.properties.description, this)
  },
  observers: {
    description (description) {
      comi(description, this)
    }
  }
})
