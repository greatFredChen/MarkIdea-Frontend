const cloud = require('wx-server-sdk')
const axios = require('axios')
const qs = require('qs')

cloud.init()

const db = cloud.database()
const key = process.env.APIKEY // 需要在环境变量中设置 KEY
const BASEURL = 'http://49.235.106.108:8080'
const failPck = {
  Msg: 'fail to add Idea!',
  code: -1
}
const okPck = {
  Msg: 'Add Idea successfully!',
  code: 201
}

exports.main = async (event, context) => {
  console.log(event)
  let ideaId = -1

  // Try to connect to Neo4j server
  try {
    const res = await axios.post(`${BASEURL}/idea/create`, qs.stringify({
      key
    }))
    console.log('connecting to Neo4j server', res)
    if (res.data.idea_id === undefined) {
      throw new Error()
    }
    ideaId = res.data.idea_id
  } catch (e) {
    console.log('connect to Neo4j server failed!', e)
    return failPck
  }

  // Neo4j Insert Ok
  // add a marker to the database
  try {
    const res = await db.collection('Idea').add({
      data: {
        ...event.marker,
        idea_id: ideaId
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
    return failPck
  }

  // Insert into wxcloud db ok && Neo4j ok
  // get collection of markers
  const res = await db.collection('Idea').get()
  console.log(res)

  return {
    ...okPck,
    markers: res.data
  }
}
