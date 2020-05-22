// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const qs = require('qs')

cloud.init()

const db = cloud.database()

const okPck = {
  Msg: 'get Idea successfully!',
  code: 201
}
const failPck = {
  Msg: 'fail to get Idea!',
  code: -1
}

/**
 * 从微信云开发数据库中获取 idea 信息
 * @param {ideaId 应对应着集合 Idea 中的 _id 字段} ideaId
 */
async function fetchIdeaFromWxdb (ideaId) {
  const res = await db.collection('Idea').doc(ideaId).get()
  console.log(res)
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

// 云函数入口函数
exports.main = async (event, context) => {
  const ideaId = event.ideaId
  const resWxdb = await fetchIdeaFromWxdb(ideaId)
  console.log(resWxdb)
  const resNeo4j = await fetchIdeaFromNeo4j(ideaId)
  return {
    ...okPck,
    ...resWxdb,
    ...resNeo4j
  }
}
