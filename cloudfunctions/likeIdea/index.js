// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const cmd = db.command

async function likeTransaction (idea, ideaId, userId) {
  return await db.runTransaction(async transaction => {
    // 点赞, 创建点赞事件
    const add = await transaction.collection('IdeaLikeEvent').add({
      data: {
        user_id: userId,
        idea_id: ideaId,
        create_at: new Date().getTime()
      }
    })
    if (!add._id) {
      // 创建失败
      await transaction.rollback({
        code: 500,
        msg: '创建点赞事件失败',
        error: add
      })
    }
    // console.log('add')
    // console.log(add)
    let update = null
    let likes = null
    if (idea.likes) {
      update = await transaction.collection('Idea').doc(ideaId)
        .update({ data: { likes: cmd.inc(1) } })
      likes = idea.likes + 1
    } else {
      update = await transaction.collection('Idea').doc(ideaId)
        .update({ data: { likes: 1 } })
      likes = 1
    }
    // 检查更新状态
    // console.log('update')
    // console.log(update)
    if (update.stats.updated === 1) {
      // 更新成功
      return {
        code: 200,
        likes: likes,
        liked: true
      }
    } else {
      // 更新失败
      await transaction.rollback({
        code: 500,
        msg: '更新Idea点赞数失败',
        error: update
      })
    }
  })
}

async function dislikeTransaction (idea, ideaId, ideaLikeEventId) {
  return await db.runTransaction(async transaction => {
    // 取消点赞, 删除点赞事件
    const update = await transaction.collection('Idea').doc(ideaId)
      .update({
        data: { likes: cmd.inc(-1) }
      })
    if (update.stats.updated !== 1) {
      await transaction.rollback({
        code: 500,
        msg: 'Idea点赞数更新失败',
        error: update
      })
    }
    // console.log('update')
    // console.log(update)
    // console.log(ideaLikeEventId)
    const remove = await db.collection('IdeaLikeEvent').doc(ideaLikeEventId).remove()
    if (remove.stats.removed !== 1) {
      await transaction.rollback({
        code: 500,
        msg: 'IdeaLikeEvent删除失败',
        error: remove
      })
    }
    // console.log('remove')
    // console.log(remove)
    return {
      code: 200,
      likes: idea.likes - 1,
      liked: false
    }
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  // 用户点赞或取消点赞Idea对象
  // 参数: event
  // {
  //    idea_id: 必要, 点赞的Idea
  //    user_id: 必要, 点赞用户的唯一标识符
  // }
  // 返回
  // 正常:
  // {
  //   code: 200 code=200 表示正常
  //   likes: 整数, 点赞后的赞数
  //   liked: 布尔, 请求此函数后, 用户是否对Idea点赞, true则表明用户点赞, 否则不是
  // }
  // 不正常:
  // {
  //   code: 非200
  //   error: 异常信息体
  //   msg: 异常错误信息描述
  // }
  // 参数检查
  if (!event.idea_id || !event.user_id) { return { code: 400, msg: '输入参数不正确', error: {} } }
  const ideaId = event.idea_id.toString()
  const userId = event.user_id.toString()
  // 找到对应的idea对象
  let idea = await db.collection('Idea').field({ _id: true, likes: true }).where({ _id: ideaId }).get()
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
  // console.log(idea)
  // 查找用户是否有对Idea点赞
  const ideaLikeEventId = await db.collection('IdeaLikeEvent').field({ _id: true })
    .where({
      idea_id: ideaId,
      user_id: userId
    }).get()
  // console.log('ideaLikeEventId')
  // console.log(ideaLikeEventId)
  try {
    return ideaLikeEventId.data.length > 0
      // 取消点赞
      ? await dislikeTransaction(idea, ideaId, ideaLikeEventId.data[0]._id)
      // 点赞
      : await likeTransaction(idea, ideaId, userId)
  } catch (e) {
    if (e.code) {
      // 自定义的错误
      return e
    }
    return {
      code: 500,
      msg: '未知事务错误',
      error: e
    }
  }
}
