// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const marker = event.marker
  let Msg = ''
  let code = 0
  let resMarker = []

  // add a marker to the database
  await db.collection('Idea').add({
    data: {
      author_id: marker.author_id,
      title: marker.title,
      created_at: marker.created_at,
      likes: marker.likes,
      description: marker.description,
      latitude: marker.latitude,
      longitude: marker.longitude
    }
  }).then(res => {
    Msg = 'Add Idea successfully!'
    code = 201
  }).catch(err => {
    Msg = 'fail to add Idea!'
    code = -1
  })

  // get collection of markers
  await db.collection('Idea').get(
  ).then(res => {
    resMarker = res.data
  })

  return {
    Msg: Msg,
    code: code,
    markers: resMarker
  }
}
