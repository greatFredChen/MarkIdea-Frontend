// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const okPck = {
  Msg: 'get Idea successfully!',
  code: 0
}
const failPck = {
  Msg: 'fail to get Idea!',
  code: -1
}
const kvSetForWxdb = {
  title: 'title',
  description: 'description',
  author_id: 'author_id',
  markerIcon: 'markerIcon',
  items: 'items'
}

const MAX_FETCH_URL_COUNT = 50
const CLOUD_FILE_HEAD = 'cloud://'
const MARKDOWN = 'MARKDOWN'

/**
 * 从微信云开发数据库中获取 idea 信息
 * @param {ideaId 应对应着集合 Idea 中的 _id 字段} ideaId
 * @param {用于筛选替换字段名的 object} whatIneed
 */
async function fetchIdeaFromWxdb (ideaId, whatIneed) {
  const res = await db.collection('Idea').doc(ideaId).get()
  console.log(res)
  // key 我需要的键 value 我修改后的键

  const ret = {}
  for (const key in whatIneed) {
    if (!Object.prototype.hasOwnProperty.call(res.data, key) &&
        key !== kvSetForWxdb.items // 兼容老的没有 items 的 idea
    ) {
      throw new Error(`record has not key [${key}]`)
    }
    ret[whatIneed[key]] = res.data[key]
  }
  return ret
}

/**
 * 将想法子项中的 file cloudID 替换成 tempUrl
 * @param {*} items 想法子项
 * @returns fileID2SwapSrc fileID 到 tempUrl 的映射
 */
async function replaceCloudID2TempUrl (items) {
  // 获取分割的 fileID list
  // getTempUrl 每次最多获取 MAX_FETCH_URL_COUNT 个文件 url
  const tmpList = items.filter(item => item.type !== MARKDOWN)
  const fetchList = []
  const oneTimeFetchList = []
  for (const i in tmpList) {
    if ((oneTimeFetchList.length !== 0) && ((i % MAX_FETCH_URL_COUNT) === 0)) {
      fetchList.push([...oneTimeFetchList])
      oneTimeFetchList.length = 0
    }
    oneTimeFetchList.push(tmpList[i].src)
  }
  if (oneTimeFetchList.length !== 0) {
    fetchList.push([...oneTimeFetchList])
  }
  console.log(fetchList)
  // 设置 fileID 到 换取的src 的映射
  const fileID2SwapSrc = new Map()
  for (const i of fetchList) {
    try {
      console.log(`fetch ${i.length} urls`)
      const res = await cloud.getTempFileURL({
        fileList: i
      })
      for (const j of res.fileList) {
        fileID2SwapSrc.set(j.fileID, j.tempFileURL)
      }
    } catch (err) {
      console.log(err)
    }
  }
  // 将 换取的src 设置到 items 上
  for (const i of items) {
    if (i.type === MARKDOWN) {
      // 纯文本保持原样
      continue
    }
    if (fileID2SwapSrc.has(i.src)) {
      i.src = fileID2SwapSrc.get(i.src)
    }
  }
  return fileID2SwapSrc
}

/**
 * 获取 idea 详情
 *
 * @param {*} event
 * @param {*} context
 * @returns
 * 成功
 * {
 *   Msg: 'get Idea successfully!',
*    code: 0
 *   ...other
 * }
 * 失败
 * {
 *   Msg: 'fail to get Idea!',
 *   code: -1,
 *   ...Error
 * }
 * idea 结构
 * title: String,
 * description: String,
 * author_id: String,
 * markerIcon: Number or String,
 * items: [{
 *   _id: String,
 *   src: String,
 *   subTitle: String,
 *   type: String
 * }]
 * 数据库中的 items.src 可能是文本或者cloud file ID
 * 从此接口流出的数据其 items src 可能是文本或者 tempUrl，即将 cloudID 替换成了 url
 */
exports.main = async (event, context) => {
  console.log(event)
  try {
    const ideaId = String(event.ideaId)
    const resWxdb = await fetchIdeaFromWxdb(ideaId, kvSetForWxdb)
    if (resWxdb[kvSetForWxdb.items] !== undefined) {
      await replaceCloudID2TempUrl(resWxdb[kvSetForWxdb.items])
    }
    console.log(resWxdb)
    return {
      ...okPck,
      ...resWxdb
    }
  } catch (e) {
    // String(ideaId) 查询失败 (not exist) 都会被此处捕获
    // 微信数据库查询结果中没有需要的 key，在此处被捕获
    console.log(e)
    return {
      ...failPck,
      Error: e.toString()
    }
  }
}
