// components/markdownBox/markdownBox.js
const comi = require('../../comi/comi.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: String
  },
  observers: {
    src (src) {
      comi(src, this)
    }
  }
})
