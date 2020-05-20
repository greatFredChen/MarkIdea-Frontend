const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 比较版本号 version1 >= version2时返回true
const compareVersion = (version1, version2) => {
  let v1 = version1.split('.') // array
  let v2 = version2.split('.') // array
  let len = Math.max(v1.length, v2.length)
  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }
  // 比较每一位
  for (let i = 0; i < len; i++) {
    let num1 = parseInt(v1[i])
    let num2 = parseInt(v2[i])
    if (num1 < num2) {
      return false // version1 < version2
    } else if (num1 > num2) {
      return true // version1 > version2
    }
  }
  return true // version1 == version2
}

module.exports = {
  formatTime: formatTime,
  compareVersion: compareVersion,
}