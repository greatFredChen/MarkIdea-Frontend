// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init()

const db = cloud.database()
const cmd = db.command

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

const MAX_FETCH_URL_COUNT = 100

/**
 * 从微信云开发数据库中获取 idea 信息
 * @param {ideaId 应对应着集合 Idea 中的 _id 字段} ideaId
 * @param {用于筛选替换字段名的 object} whatIneed
 */
async function fetchIdeaFromWxdb (ideaId, whatIneed) {
  const res = await db.collection('Idea').doc(ideaId).get()
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
/*async function replaceCloudID2TempUrl (items) {
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
}*/

/**
 * 通过Id列表获取对应对象的指定字段
 * @param {list} ideaIdList
 */
async function getIdeasInfo (ideaIdList) {
  try {
    ideaIdList = ideaIdList.map(String)
    let res = await db.collection('Idea').field({
      title: true,
      longitude: true,
      latitude: true,
      markerIcon: true
    }).where({ _id: cmd.in(ideaIdList) }).get()
    res = res.data
    const resMap = new Map()
    for (let i = 0; i < res.length; i++) {
      resMap.set(Number(res[i]._id), res[i])
    }
    return resMap
  } catch (err) {
    throw Error({
      msg: '获取关联idea信息失败',
      error: err
    })
  }
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
  try {
    const ideaId = String(event.ideaId)
    let res = null
    if (event.backend_host) {
      // 如果有backend_host参数, 则表明想要额外获取该idea的直接关联
      res = await axios({
        url: event.backend_host + '/idea/get_relationship',
        params: { idea_id: Number(ideaId) },
        method: 'GET',
        responseType: 'json'
      })
    }

    const from = res.data.from
    const to = res.data.to
    // 获取直接关联的idea的更多信息, 比如经纬度, 标题, 图标等
    if (from && from.length > 0) {
      const fromIdList = []
      for (let i = 0; i < from.length; i++) {
        fromIdList.push(from[i].from)
      }
      const ideaInfo = await getIdeasInfo(fromIdList)
      for (let i = 0; i < from.length; i++) {
        from[i].from = {
          id: Number(from[i].from),
          ...ideaInfo.get(Number(from[i].from))
        }
      }
    }
    if (to && to.length > 0) {
      const toIdList = []
      for (let i = 0; i < to.length; i++) {
        toIdList.push(to[i].to)
      }
      const ideaInfo = await getIdeasInfo(toIdList)
      for (let i = 0; i < to.length; i++) {
        to[i].to = {
          id: Number(to[i].to),
          ...ideaInfo.get(Number(to[i].to))
        }
      }
    }

    const resWxdb = await fetchIdeaFromWxdb(ideaId, kvSetForWxdb)
    if (resWxdb[kvSetForWxdb.items] === undefined) {
      resWxdb[kvSetForWxdb.items] = [] // 返回的项里一定要有这个数组
    }
    return {
      ...okPck,
      ...resWxdb,
      relationship: {
        from: from || [],
        to: to || []
      }
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
