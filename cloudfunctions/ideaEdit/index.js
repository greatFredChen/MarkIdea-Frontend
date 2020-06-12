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

/**
 * 从文件存储中删除用户移除或者替换的文件
 * @param {Array} oldItems 旧的 items 列表
 * @param {Array} newItems 新的 items 列表
 */
function removeDeletedFiles (oldItems, newItems) {
  const MARKDOWN = 'MARKDOWN'
  const CLOUD_PRE_FIX = 'cloud://'
  const MAX_REMOVE_ITEMS = 50
  // 预删除列表
  const deletedCloudFileSet = new Set()
  // 假设所有的文件都要删除
  for (const oldItem of oldItems) {
    if (oldItem.type !== MARKDOWN && oldItem.src !== undefined && oldItem.src.startsWith(CLOUD_PRE_FIX)) {
      if (!deletedCloudFileSet.has(oldItem.src)) {
        deletedCloudFileSet.add(oldItem.src)
      }
    }
  }
  console.log('旧文件列表: ', deletedCloudFileSet)
  // 将仍然存在的文件从预删除列表移除
  for (const newItem of newItems) {
    if (newItem.type !== MARKDOWN && newItem.src !== undefined && newItem.src.startsWith(CLOUD_PRE_FIX)) {
      if (deletedCloudFileSet.has(newItem.src)) { // 如果文件没有被删除，就把它从预删除文件列表删除
        deletedCloudFileSet.delete(newItem.src)
      }
    }
  }
  // 预删除文件列表中剩下的都是新 items 中不需要的文件
  // 批量删除
  console.log('将要删除文件：', deletedCloudFileSet)
  const deleteEpoch = [] // 批量删除列表
  for (const item of deletedCloudFileSet) {
    deleteEpoch.push(item)
    if (deleteEpoch.length >= MAX_REMOVE_ITEMS) {
      // 异步删除, 不需要用户等待
      cloud.deleteFile({
        fileList: Array.from(deleteEpoch)
      }).then(res => console.log).catch(err => console.error)
      deleteEpoch.length = 0
    }
  }
  if (deleteEpoch.length > 0) {
    cloud.deleteFile({
      fileList: Array.from(deleteEpoch)
    }).then(res => console.log).catch(err => console.error)
  }
}

exports.main = async (event, context) => {
  console.log('last 06121812')
  console.log(event)
  const app = new TcbRouter({
    event
  })
  const wxContext = cloud.getWXContext()

  /**
   * 路由 ideaEdit，修改想法标题和描述
   *
   * @param {String} _id 想法 id
   * @param {String} title 修改后的标题
   * @param {String} description 修改后的描述
   * @param {String} items 想法子项
   * @param {String} markerIcon 修改后的图标 id
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
    const resKey = ['_id', 'title', 'description', 'items', 'markerIcon']
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

      // 移除用户删除的文件
      // 文件删除有可能会失败，不需要用户等待
      removeDeletedFiles(Array.from(idea.items || []),Array.from(event.items || []))

      // 更新数据库
      await doc.update({
        data: {
          title: event.title,
          description: event.description,
          items: event.items,
          markerIcon: event.markerIcon
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
