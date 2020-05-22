const cloud = require('wx-server-sdk')
const axios = require('axios')
const qs = require('qs')
const sensitiveData = require('./sensitive-config.js')

cloud.init()

const db = cloud.database()
const key = sensitiveData.backendKey // 需要在环境变量中设置 KEY
const BASEURL = sensitiveData.backendHost
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
  // get the origin markers
  let _res = await db.collection('Idea').get()
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
    return {
      ...failPck,
      markers: _res.data
    }
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
    return {
      ...failPck,
      markers: _res.data
    }
  }

  // Insert into wxcloud db ok && Neo4j ok
  // get collection of markers
  _res = await db.collection('Idea').get()
  console.log(_res)

  return {
    ...okPck,
    markers: _res.data
  }
}
