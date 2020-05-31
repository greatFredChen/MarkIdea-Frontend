// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const axios = require('axios')
const qs = require('qs')

// 云函数入口函数
exports.main = async (event, context) => {
  // 请求后端创建两个节点的连接
  /**
   * 参数: event
   * {
   *    backendHost(String) 必要
   *    key(String) 必要
   *    from(Number) 必要
   *    to(Number) 必要
   *    directional(Number) 必要
   *    type(String) 必要
   *    properties(json) 非必要，并且现在暂时不支持该参数
   * }
   * 返回
   * 正常:
   * {
   *    code: 201
   *    relation_id: 刚创建成功的relation_id
   * }
   * 不正常:
   * {
   *    code: 非201
   *    error: 异常信息体
   *    msg: 异常错误信息描述
   * }
   */
  const BASEURL = event.backendHost // 后端ip地址
  let relationId = -1
  try {
    const res = await axios.post(`${BASEURL}/idea/create_relationship`, qs.stringify({
      key: event.key,
      from: event.from,
      to: event.to,
      directional: event.directional,
      type: event.type
    }))
    console.log(res)
    if (res.data.relation_id === undefined) {
      throw new Error()
    }
    relationId = res.data.relation_id
  } catch (error) {
    console.log(error)
    return {
      code: error.response.status ? error.response.status : 500,
      error: error,
      msg: '创建Idea关联失败!'
    }
  }

  return {
    code: 201,
    relation_id: relationId
  }
}
