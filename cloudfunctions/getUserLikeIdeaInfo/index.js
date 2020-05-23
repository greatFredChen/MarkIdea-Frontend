// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
const db = cloud.database()
exports.main = async (event, context) => {
  // 获取用户是否已经点赞过某个Idea, 并获取Idea的总点赞数
  // 参数: event
  // {
  //    idea_id 必要 string
  //    user_id 必要 string:
  // }
  // 返回
  // 正常:
  // {
  //   code: 200
  //   liked: 布尔, 用户是否已经点赞过某个Idea
  //   likes: int, idea的总点赞数
  // }
  // 不正常:
  // {
  //   code: http 状态码
  //   error: 异常信息体
  //   msg: 异常错误信息描述
  // }
  if (!event.user_id || !event.idea_id) { return { code: 400, msg: '输入参数不正确', error: {} } }
  const ideaId = event.idea_id.toString()
  const userId = event.user_id
  const idea = await db.collection('Idea').field({likes: true}).where({_id:ideaId}).get()
  // console.log(idea)
  if (idea.data.length === 0) {
    return {
      code: 404,
      error: idea,
      msg: '找不到idea'
    }
  }
  const likes = idea.data[0].likes
  const events = await db.collection('IdeaLikeEvent').where({ idea_id:ideaId, user_id:userId}).count()
  // console.log(events)
  return {
    code: 200,
    liked: events.total > 0,
    likes: likes
  }
}