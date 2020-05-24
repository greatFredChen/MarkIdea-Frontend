// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const qs = require('qs')

cloud.init()

const db = cloud.database()

async function deleteIdeaTransaction (backendHost, key, ideaId) {
  // 删除Idea节点
  // 先请求后端删除Idea节点, 再删除云数据库中的idea数据
  try {
    const res = await axios.post(backendHost + '/idea/delete', qs.stringify({
      key: key,
      idea_id: ideaId
    }))
    // console.log('res')
    // console.log(res)
    if (res.status !== 204) {
      res.response.status = 500
      throw res
    }
  } catch (e) {
    // console.log('请求后端删除Idea节点失败')
    // console.log(e)
    return {
      code: e.response.status ? e.response.status : 500,
      msg: '请求后端删除Idea节点失败',
      error: e
    }
  }
  try {
    // 删除云数据库的记录
    const remove = await db.collection('Idea').doc(ideaId).remove()
    if (remove.stats.removed !== 1) {
      const error = {
        code: 500,
        msg: '云数据库Idea删除失败',
        error: remove
      }
      throw error
    }
    // 事务完成
    return { code: 204 }
  } catch (e) {
    return {
      code: e.code ? e.code : 500,
      msg: '请求后端删除Idea节点失败',
      error: e
    }
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  // 用户删除指定Idea
  // 参数: event
  // {
  //    idea_id: 必要, 删除的Ideaid
  //    user_id: 必要, 用户的唯一标识符, 用于识别Idea是否由用户创建
  //    key: 必要, 后端识别小程序发送的请求使用的key
  //    backend_host: 必要， 后端地址
  // }
  // 返回
  // 正常:
  // {
  //   code: 204 删除正常, 无内容
  // }
  // 不正常:
  // {
  //   code: 非200
  //   error: 异常信息体
  //   msg: 异常错误信息描述
  // }
  // 参数检查
  if (!event.idea_id || !event.user_id || !event.key || !event.backend_host) {
    return { code: 400, msg: '输入参数不正确', error: {} }
  }
  const ideaId = event.idea_id.toString()
  const userId = event.user_id.toString()
  // 找到对应的idea对象
  let idea = await db.collection('Idea').field({ _id: true, author_id: true }).where({ _id: ideaId }).get()
  // console.log('idea')
  // console.log(idea)
  if (idea.data.length < 1) {
    return {
      code: 404,
      error: {},
      msg: '找不到id为' + ideaId + '的Idea对象'
    }
  }
  idea = idea.data[0]
  if (idea.author_id !== userId) {
    // 不是由用户创建的idea
    return {
      code: 403,
      error: {},
      msg: '无权限, 该Idea不是由该用户创建的'
    }
  }
  return deleteIdeaTransaction(event.backend_host, event.key, ideaId)
}
