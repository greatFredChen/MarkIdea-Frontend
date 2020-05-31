// components/audioBox/audioBox.js
const STATUS = {
  PLAY: 1,
  PAUSE: 2,
  STOP: 3
}
const app = getApp()
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
    ...STATUS,
    currentVolume: 50,
    currentRate: 1.0
  },

  lifetimes: {
    detached () {
      this.data.audio.destroy() // 销毁当前实例
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindplay () {
      // 播放音频
      this.data.audio.play()
    },
    bindpause () {
      // 暂停播放
      this.data.audio.pause()
    },
    bindstop () {
      // 停止播放 再次开始会从头开始播放
      this.data.audio.stop()
    },
    volumeChange (e) {
      this.setData({
        currentVolume: e.detail.value
      })
    },
    rateChange (e) {
      this.setData({
        currentRate: e.detail.value
      })
    }
  },
  observers: {
    // 一旦src发生变化就重新创建实例并绑定事件！
    async src (src) {
      if (src.length === 0) {
        return
      }
      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.autoplay = false
      innerAudioContext.src = src
      // 监听播放事件
      innerAudioContext.onPlay(() => {
        this.setData({
          status: STATUS.PLAY
        })
      })
      // 监听暂停事件
      innerAudioContext.onPause(() => {
        this.setData({
          status: STATUS.PAUSE
        })
      })
      // 监听停止事件
      innerAudioContext.onStop(() => {
        this.setData({
          status: STATUS.STOP
        })
      })
      // 监听错误事件
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })
      // 监听结束事件 自然播放到结束
      innerAudioContext.onEnded((res) => {
        this.setData({
          status: STATUS.STOP
        })
      })
      this.setData({
        audio: innerAudioContext
      })
    },
    currentVolume (currentVolume) {
      this.setData({
        'audio.volume': currentVolume / 100 // 注意这里一定要除以100，因为volume范围为0-1
      })
    },
    currentRate (currentRate) {
      this.setData({
        'audio.playbackRate': currentRate
      })
    }
  }
})
