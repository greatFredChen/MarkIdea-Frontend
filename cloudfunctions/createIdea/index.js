const cloud = require('wx-server-sdk')
const axios = require('axios')
const qs = require('qs')

cloud.init()

const db = cloud.database()
const failPck = {
  Msg: 'fail to add Idea!',
  code: -1
} // 失败回调
const okPck = {
  Msg: 'Add Idea successfully!',
  code: 201
} // 成功回调

exports.main = async (event, context) => {
  // 该函数用于创建Idea
  // 具体事务为:
  // 1.当参数传入时，先向后端发出post请求，参数为key
  // 若成功，则进入下一步，若失败，则返回失败回调
  // 2.成功在后端创建Idea后，就在云数据库创建Idea，若成功则进入下一步，若失败则删除后端创建的新Idea
  // 并返回失败回调
  // 传入参数: event
  // {
  //  idea 必要 Object 新创建Idea
  //  key 必要 String 后端密钥
  //  backendHost 必要 String 后端地址
  //  domain_id 必要 Idea所在domain的id
  // }
  // 返回 正常:
  // {
  // okPck
  // }
  // 返回 不正常:
  // {
  // failPck
  // }
  console.log(event)
  const key = event.key // 后端key
  const BASEURL = event.backendHost // 后端ip地址
  const domainId = event.domain_id
  let ideaId = -1
  // Try to connect to Neo4j server
  try {
    const res = await axios.post(`${BASEURL}/idea/create`, qs.stringify({
      key: key,
      domain_id: domainId
    }))
    console.log('connecting to Neo4j server', res)
    if (res.data.idea_id === undefined) {
      throw new Error()
    }
    ideaId = res.data.idea_id
  } catch (e) {
    console.log('connect to Neo4j server failed!', e)
    return {
      ...failPck
    }
  }

  // Neo4j Insert Ok
  // add a idea to the database
  try {
    const res = await db.collection('Idea').add({
      data: {
        ...event.idea,
        _id: String(ideaId)
      }
    })
    console.log('Add data to cloud database successfully!', res)
  } catch (err) {
    // Insert into wxcloud db fail
    // Role back
    // Delete IdeaNode on Neo4j server
    // U Must be Ok
    console.log(err)
    try {
      const res = await axios.post(`${BASEURL}/idea/delete`, qs.stringify({
        key,
        idea_id: ideaId
      }))
      console.log('Delete successfully!', res)
    } catch (err) {
      console.log('Delete failed!', err)
    }
    return {
      ...failPck
    }
  }

  return {
    ...okPck
  }
}
