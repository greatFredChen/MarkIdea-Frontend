/**
 * 当前云函数使用了 tcb-router
 * 后期考虑将更多的路由纳入此云函数，减少资源消耗
 */
// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

const okPck = {
  Msg: 'Edit Idea successfully!',
  code: 0
}
const failPck = {
  Msg: 'fail to edit Idea!',
  code: -1
}
const MAX_LENGTH = 200

cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  console.log(event)
  const app = new TcbRouter({
    event
  })
  const wxContext = cloud.getWXContext()

  /**
   * 路由 ideaEdit，修改想法标题和描述
   *
   * @param {ideaId} 想法 id
   * @param {title} 修改后的标题
   * @param {description} 修改后的描述
   * @returns
   * 成功
   * {
   *   ...okPck,
   *   ...idea.data
   * }
   * 失败
   * {
   *   ...failPck,
   *   ...Error
   * }
   */
  app.router('ideaEdit', async (ctx, next) => {
    const resKey = ['_id', 'title', 'description']
    console.log(ctx)
    try {
      // 检查负载是否缺少
      for (const key of resKey) {
        if (!Object.prototype.hasOwnProperty.call(event, key)) {
          throw new Error(`key[${key}] not found`)
        }
      }
      const authorId = wxContext.OPENID
      const doc = await db.collection('Idea').doc(event._id)
      const idea = (await doc.get()).data
      console.log(idea)

      // 修改的不是自己的 idea
      if (idea.author_id !== authorId) {
        console.log(`author_id[${authorId}] try to edit idea of author_id[${idea.author_id}] illegally`)
        throw new Error('User has no permission')
      }

      // 身份验证通过，检验数据长度
      if (event.title.length > MAX_LENGTH) {
        throw new Error('Title is too long')
      }
      if (event.description.length > MAX_LENGTH) {
        throw new Error('Description is too long')
      }

      await doc.update({
        data: {
          title: event.title,
          description: event.description
        }
      })
      ctx.body = {
        ...okPck,
        idea: (await doc.get()).data
      }
    } catch (err) {
      console.log(err)
      ctx.body = {
        ...failPck,
        Error: err
      }
    }
  })

  return app.serve()
}
