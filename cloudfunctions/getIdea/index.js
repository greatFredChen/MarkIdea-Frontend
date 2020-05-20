// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let Msg = ''
  let code = 0
  let markers = []

  let check = await db.collection('Idea').get(

  ).then(res => {
    markers = res.data
    Msg = 'get Idea successfully!'
    code = 201
  }).catch(err => {
    Msg = 'fail to get Idea!'
    code = -1
    markers = []
  })

  return {
    Msg: Msg,
    code: code,
    markers: markers
  }
}