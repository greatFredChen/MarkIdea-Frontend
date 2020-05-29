import { IdeaRankCalculator } from './IdeaRankCalculator'
import { Idea } from './Idea'

const app = getApp()

class IdeaManager {
  constructor () {
    this._rankCalculator = new IdeaRankCalculator({
      likes: 1
    }, {}, 0.08)
    // ideas 里存放着映射 id => idea，这个映射的构建在 event setIdeas 里完成
    // 绘制 polyline 想法关联需要使用这个映射，因此绘制动作可以发生在 ideaMap 更新之后
    this.ideas = new Map()
    // idea对象之间关联关系
    this.relationships = new Map()
  }

  /**
   * 覆盖更新该对象的ideas map,
   * @param {List} ideaList 列表, 每个列表是一个对象, 会将其中的信息包装成Idea对象, 放在ideas里,
   * 注意: 列表中的对象有_id字段
   * @param {Boolean} clear 是否清空之前的数据
   */
  setGraph (ideaList, relationshipList, clear = false) {
    if (clear) {
      this.ideas.clear()
      this.relationships.clear()
    }
    for (let i = 0; i < ideaList.length; i++) {
      const idea = ideaList[i]
      this.ideas.set(Number(idea._id),
        new Idea(idea)
      )
    }
    for (let i = 0; i < relationshipList.length; i++) {
      this.relationships.set(Number(relationshipList[i].id), relationshipList[i])
    }
  }

  /**
   * 根据Idea管理器的rank计算规则计算输入的idea对象引用列表的每一个idea对象的rank值
   * @param {*} ideaList 需要计算的idea引用列表
   */
  getRank (ideaList) {
    return this._rankCalculator.getIdeasRank(ideaList)
  }

  /**
   * 请求创建Idea云函数, 返回创建好的idea对象, 不会加入ideas中, 返回Idea对象
   * @param {*} title
   * @param {*} description
   * @param {*} markerIcon
   * @param {*} latitude
   * @param {*} longitude
   */
  async createIdea (title, description, markerIcon, latitude, longitude) {
    let res = []
    const currentTime = new Date().getTime() // 单位为ms
    // 获取当前位置的domain
    const domain = await app.domainManager.getLocalDomain({
      latitude,
      longitude
    })

    // 创建新的想法
    res = await wx.cloud.callFunction({
      name: 'createIdea',
      data: {
        idea: {
          latitude: latitude,
          longitude: longitude,
          author_id: app.globalData.openid,
          title: title,
          created_at: currentTime,
          likes: 0,
          description: description,
          // 云存储中的fileId
          markerIcon // 传入的 markerIcon
        },
        key: app.globalData.backendKey,
        backendHost: app.globalData.backendHost,
        domain_id: domain.id
      }
    })
    // console.log(res)
    if (res.result.code !== 201) {
      throw res
    }
    return new Idea(res.data)
  }

  /**
   * 请求创建想法关联云函数, 返回空
   * 参数: param
   * {
   *  from 连接起始想法id
   *  to  连接终点想法id
   *  directional 无向边0 有向边1
   *  type 关系类型
   * }
   */
  async createRelationship (param) {
    const res = await wx.cloud.callFunction({
      name: 'createRelationship',
      data: {
        backendHost: app.globalData.backendHost,
        key: app.globalData.backendKey,
        from: param.from,
        to: param.to,
        directional: param.directional,
        type: param.type
      }
    })
    if (res.result.code !== 201) {
      throw new Error(res)
    }
  }

  /**
   * 通知云端和map组件删除一个Idea对象, 会清除ideas里的引用
   * @param {*} ideaId idea对象的id , 既可以是Number也可以是字符串
   */
  async deleteIdea (ideaId) {
    try {
      ideaId = Number(ideaId)
      const res = await wx.cloud.callFunction({
        name: 'deleteIdea',
        data: {
          idea_id: ideaId,
          user_id: app.globalData.openid,
          key: app.globalData.backendKey,
          backend_host: app.globalData.backendHost
        }
      })
      if (res.result.code !== 204) {
        throw res
      }
      // 删除成功, 删除本地的信息
      this.ideas.delete(ideaId)
      // 删除关联关系
      const toDeleteRelationshipId = []
      this.relationships.forEach((value, key, mapObj) => {
        if (Number(value.from) === ideaId || Number(value.to) === ideaId) {
          toDeleteRelationshipId.push(key)
        }
      })
      for (let i = 0; i < toDeleteRelationshipId.length; i++) {
        this.relationships.delete(toDeleteRelationshipId[i])
      }
      // 删除完毕, 刷新
      app.event.emit('refreshLocalDomain')
    } catch (err) {
      throw Error({
        msg: '删除想法对象失败',
        error: err
      })
    }
  }
}

export { IdeaManager }
