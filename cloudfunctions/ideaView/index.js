// 云函数入口文件
const cloud = require('wx-server-sdk')
// const axios = require('axios')
// const qs = require('qs')

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
  description: 'description'
}

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
    if (!Object.prototype.hasOwnProperty.call(res.data, key)) {
      throw new Error(`record has not key [${key}]`)
    }
    ret[whatIneed[key]] = res.data[key]
  }
  return ret
}

/**
 * 从 Neo4j 获取 idea 信息
 * @param {对应 Neo4j 图数据库中节点的 id} ideaId
 */
async function fetchIdeaFromNeo4j (ideaId) {
  // TODO: fetch properties from Neo4j
  // const res = await axios.post(`${BASEURL}/idea/get`, qs.stringify({
  //   key: key,
  //   idea_id: ideaId
  // })
  return {}
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
 */
exports.main = async (event, context) => {
  console.log(event)
  try {
    const ideaId = Number(event.ideaId)
    const resWxdb = await fetchIdeaFromWxdb(ideaId, kvSetForWxdb)
    console.log(resWxdb)
    const resNeo4j = await fetchIdeaFromNeo4j(ideaId)
    console.log(resNeo4j)
    return {
      ...okPck,
      ...resWxdb,
      ...resNeo4j
    }
  } catch (e) {
    // Number(ideaId) 可能为 小数\NaN\整数，查询失败 (not exist) 都会被此处捕获
    // 微信数据库查询结果中没有需要的 key，在此处被捕获
    console.log(e)
    return {
      ...failPck,
      Error: e
    }
  }
}
