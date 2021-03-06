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

// 删除idea的时候将idea对应的点赞事件全部删除
// 参数: ideaId: String
async function deleteLikeEvent (ideaId) {
  // 因为要一次删除多个节点，因此无法使用事务...
  return new Promise(async (resolve, reject) => {
    try {
      let res = await db.collection('IdeaLikeEvent').where({
        idea_id: ideaId
      }).remove()
      if (res.stats.removed === undefined || res.stats.removed === null) {
        throw new Error(res.errMsg)
      }
      resolve({
        code: 204 // 删除成功
      })
    } catch (e) {
      reject({
        code: 500,
        msg: '删除点赞事件失败！',
        error: e
      })
    }
  })
}

// 删除idea的时候将item里的文件全部删除
// fileList: 云文件 ID 字符串数组 用来删除idea中的items里的文件
async function deleteIdeaFiles (ideaId) {
  return new Promise(async (resolve, reject) => {
    try {
      // 获取items列表
      const idea = await db.collection('Idea').doc(ideaId).get()
      const items = idea.data.items
      let fileList = []
      for(let i = 0; i < items.length; i++) {
        fileList.push(items[i].src) // 把cloudId加入文件数组
      }
      const result = await cloud.deleteFile({
        fileList
      })
      if (!deleteStatus(result.fileList)) {
        // 删除失败，抛出异常
        throw new Error(result.errMsg)
      }
      resolve(result.fileList)
    } catch (e) {
      reject({
        code: 500,
        Msg: 'delete file failed!',
        err: e
      })
    }
  })
}

// 判断删除文件是否异常，若正常返回true，异常返回false
function deleteStatus (fileList) {
  for(let i = 0; i < fileList.length; i++) {
    fileDeleteRes = fileList[i]
    if (fileDeleteRes.status !== 0) {
      return false
    }
  }
  return true
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
  // 删除点赞事件
  try {
    await deleteLikeEvent(ideaId)
  } catch (e) {
    console.log('delete like event error:', e)
  }
  try {
    await deleteIdeaFiles(ideaId)
  } catch (e) {
    console.log('delete idea files error!', e)
  }
  // 删除idea
  return deleteIdeaTransaction(event.backend_host, event.key, ideaId)
}
