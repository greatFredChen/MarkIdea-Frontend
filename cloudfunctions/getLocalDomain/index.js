// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const axios = require('axios')
const qs = require('qs')

async function _getRegionInfo (params) {
  // 指定经纬度的地区的id和描述, 目前定为city_code
  // 参数:
  // {
  //    latitude: 纬度
  //    longitude: 经度
  //    key: 腾讯位置服务的开发者key
  // }
  // 返回:
  // {
  //    code: 200
  //    id: 地区唯一描述符
  //    desc: 地区描述
  // }
  try {
    const res = await axios({
      url: 'https://apis.map.qq.com/ws/geocoder/v1',
      params: {
        location: params.latitude + ',' + params.longitude,
        key: params.key
      },
      method: 'GET',
      responseType: 'json'
    })
    const result = res.data.result
    return {
      // 地址地区code, 唯一标识符
      id: result.ad_info.city_code,
      // 地区描述, 便于阅读
      desc : result.address_component.province + '-' +
          result.address_component.city,
      code : 200
    }
  } catch (error) {
    throw {
      msg : '获取位置逆解析信息失败',
      error: error,
      code: 500
    }
  }
}

async function _getDomainIdByRegion (params) {
  // 读取根据地区的地区的唯一标识符查找云数据库RegionDomain中对应的记录
  // 参数:
  // {
  //    id: 地区的唯一标识符
  // }
  // 返回 int
  //   如果存在记录 非负整数, 对应的domain对象的id
  //   如果不存在记录 -1
  const result = await db.collection('RegionDomain')
    .field({ domainId: true }).where({ _id: params.id }).get()
  if (result.data.length > 0) { 
    return result.data[0].domainId 
  } else {
    return -1 
  }
}

async function _createRegionDomainTransaction (params) {
  // 事务:
  //  1. 请求后端创建一个Domain对象, 并返回其domainId
  //  2. 根据后端返回的domainId, 在云数据库的RegionDomain创建一个地区唯一标识符到该domainId的映射
  // 参数:
  // {
  //    id: 地区的唯一标识符
  //    desc: 地区的描述, 便于阅读
  //    host: 后端服务器主机
  //    key: 后端服务器key
  // }
  // 返回
  // 成功:
  // {
  //   code: 201,
  //   domain_id: 新创建的domain_id
  // }
  // 请求后端创建一个domain对象, 并返回其id
  let domainId = null
  try {
    const res = await axios.post(params.host + '/domain/create',
      qs.stringify({ key: params.key })
    )
    domainId = res.data.domain_id
  } catch (err) {
    let error = {}
    error.msg = '获取当地Domain对象时申请后端创建Domain节点失败'
    error.error = err
    console.log(error)
    if (err.response.data.code === 401000) { 
      error.msg += '原因: 授权key错误'
      error.code = 401
    } else {
      error.code = 500
    }
    throw error
  }
  try {
    // 创建数据库记录
    await db.collection('RegionDomain').add({
      data: {
        _id: params.id,
        description: params.desc,
        domainId: domainId
      }
    })
  } catch (clondDbErr) {
    // 数据库记录创建失败, 请求后端回滚之前创建的domain对象
    try {
      const res = await axios.post(params.host + '/domain/delete',
        qs.stringify({
          key: params.key,
          domainId: domainId
        }))
      console.log('backenddelete')
      console.log(res)
    } catch (requestError) {
      throw {
        msg : '获取当地Domain对象申请时数据库记录创建失败后回滚',
        error : {
          cloud_db_err: clondDbErr,
          request_err: requestError
        },
        code : 500
      }
    }
    throw {
      msg : '获取当地Domain对象申请时数据库记录创建失败并成功回滚后端服务器',
      error : clondDbErr,
      code : 500
    }
  }
  return {code: 201, domain_id: domainId}
}

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取指定经纬度所属的区域对应的Domain对象
  // 处理逻辑: 首先根据腾讯位置服务请求到指定地点的所属区: 目前是到city级别, 获得所属区的唯一标识city_code
  // 比如city_code, 再根据code查询云数据库RegionDomain, 看是否有一条code记录对应着一个domainId, 如果有,
  // 则返回其domainId,
  // 如果没有对应的domain对象, 则会试图启动一个事务:
  // 该事务负责请求后端创建一个Domain对象并返回其id, 然后再往云数据库中插入一条这个Domain id和与city_code记录
  // 如果事务成功, 则返回新创建的domainId 如果事务失败, 则会返回相应的错误信息
  // 参数: event
  // {
  //    latitude 必要 number: 纬度
  //    longitude 必要 number: 经度
  //    key 必要 string: 腾讯位置服务的开发者key
  //    create_domain: 非必要 bool: 是否在找不到对应的Domain时创建一个新的Domain对象, true则会创建新的
  //                  false则不会
  //   如果create_domain为true, 则以下参数为必要, 否则非必要
  //   backend_host: 后端服务器主机
  //   backend_key: 后端服务器Key
  // }
  // 返回
  // 正常:
  // {
  //   code: 201 新domain对象创建成功 或者200 查询正常
  //   domainId: 如果是非负整数, 则是对应的domain对象id, 如果是负数, 则表明不存在对应的domain对象
  // }
  // 不正常:
  // {
  //   code: 非201
  //   error: 异常信息体
  //   msg: 异常错误信息描述
  // }

  // 参数检查
  if (!event.latitude || !event.longitude || !event.key) { return { code: 400, msg: '输入参数不正确', error: {} } }
  if (event.create_domain === true) {
    if (!event.backend_host || !event.backend_key) { return { code: 400, msg: '输入参数不正确', error: {} } }
  }

  let desc = null
  let regionId = null
  try {
    // 获取地区的id和描述信息
    const res = await _getRegionInfo({
      latitude: event.latitude,
      longitude: event.longitude,
      key: event.key
    })
    desc = res.desc
    regionId = res.id
  } catch (error) {
    return {
      msg : '获取地区信息异常',
      code : 500,
      error : error
    }
  }

  // 查询云数据库是否有对应地区信息的domainId记录
  let domainId = -1
  try {
    const res = await _getDomainIdByRegion({ id: regionId })
    domainId = res
  } catch (error) {
    return {
      msg : '获取地区domain异常',
      code : error.code ? error.code : 500,
      error : error
    }
  }

  if (domainId >= 0) {
    // 找到对应的domain
    return {
      code: 200,
      domainId: domainId
    }
  }

  // 找不到对应的domain
  if (event.create_domain === true) {
    // 试图创建新的domain
    try {
      return await _createRegionDomainTransaction({
        id: regionId,
        desc: desc,
        key: event.backend_key,
        host: event.backend_host
      })
    } catch (error) {
      return {
        msg : '创建地区domain异常',
        code : error.code ? error.code : 500,
        error : error
      }
    }
  }
  // 不创建新的domain
  return {
    code: 200,
    domainId: -1
  }
}
