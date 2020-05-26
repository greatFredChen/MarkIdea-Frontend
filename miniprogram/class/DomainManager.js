import { Domain } from './Domain'

const app = getApp()
class DomainManager {
  /**
   * 获取指定经纬度所属的domain对象
   * 参数: param
   * {
   *  latitude 纬度
   *  longitude 经度
   * }
   */
  async getLocalDomain (param) {
    // 获取当前中心对应的domain_id
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getLocalDomain',
        data: {
          latitude: param.latitude,
          longitude: param.longitude,
          key: app.globalData.qqmapKey,
          create_domain: true,
          backend_host: app.globalData.backendHost,
          backend_key: app.globalData.backendKey
        }
      }).then(res => {
        if (res.result.code === 201 || res.result.code === 200) {
          resolve(new Domain(res.result.domain.domainId))
        } else {
          throw new Error(res)
        }
      }).catch(err => {
        wx.showToast({
          title: '获取当地信息失败',
          icon: 'none',
          duration: 2000
        })
        reject(err)
      })
    })
  }
}

export { DomainManager }
