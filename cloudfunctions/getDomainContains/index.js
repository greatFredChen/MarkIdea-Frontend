// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const MAX_LIMIT = 100 // 规定最大获取idea数
const axios = require('axios')
const db = cloud.database()
const cmd = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // 请求后端服务器获取指定Domain对象所包含的所有Idea对象和Relationship对象
  // 参数: event
  // {
  //    domain_id 必要
  //    backend_host 必要 后端服务器主机
  // }
  // 返回
  // 正常:
  // {
  //   code: 200,
  //   idea: idea对象列表,
  //   relationship: 关联对象列表
  // }
  // 不正常:
  // {
  //   code: 非200
  //   error: 异常信息体
  //   msg: 异常错误信息描述
  // }
  // 参数检查
  if (!event.domain_id || !event.backend_host) { return { code: 400, msg: '输入参数不正确', error: {} } }

  let idea = null
  let relationship = null
  try {
    const res = await axios({
      url: event.backend_host + '/domain/get_domain_contains',
      params: {
        domain_id: event.domain_id,
        limit: MAX_LIMIT // 默认25个，这里设置100个
      },
      method: 'GET',
      responseType: 'json'
    })
    // console.log(res)
    idea = res.data.idea
    relationship = res.data.relationship
  } catch (error) {
    return {
      msg: '获取domain图结构失败',
      error: error,
      code: error.response.status ? error.response.status : 500
    }
  }

  const ideaList = []
  for (const each in idea) {
    // console.log(String(each))
    ideaList.push(String(each))
  }
  // console.log('ideaList')
  // console.log(ideaList)
  if (ideaList.length === 0) {
    // 如果没有id, 则直接返回
    return {
      code: 200,
      idea: [],
      relationship: []
    }
  }

  // 查询云数据库补全idea信息
  const result = await db.collection('Idea')
    .where({ _id: cmd.in(ideaList) }).limit(MAX_LIMIT).get()
  const res = result.data
  for (let i = 0; i < res.length; i++) {
    const eachIdea = res[i]
    // console.log('eachIdea')
    // console.log(eachIdea)
    const id = Number(eachIdea._id)
    eachIdea.id = id
    const labels = idea[id].labels
    if (labels) {
      eachIdea.labels = labels
    }
  }
  return {
    code: 200,
    idea: result.data,
    relationship: relationship
  }
}
