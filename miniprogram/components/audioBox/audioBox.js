// components/audioBox/audioBox.js
const STATUS = {
  PLAY: 1,
  PAUSE: 2,
  STOP: 3
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    audio: {},
    status: STATUS.STOP,
    ...STATUS
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindplay () {
      this.data.audio.play()
      this.setData({
        status: STATUS.PLAY
      })
    },
    bindpause () {
      this.data.audio.pause()
      this.setData({
        status: STATUS.PAUSE
      })
    },
    bindstop () {
      this.data.audio.stop()
      this.setData({
        status: STATUS.STOP
      })
    }
  },
  observers: {
    src (src) {
      if (src.length === 0) {
        return
      }
      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.autoplay = false
      innerAudioContext.src = src
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })
      innerAudioContext.onEnded((res) => {
        this.setData({
          status: STATUS.STOP
        })
      })
      this.setData({
        audio: innerAudioContext
      })
    }
  }
})
