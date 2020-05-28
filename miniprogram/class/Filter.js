class Filter {
  /**
   * 过滤器类
   * @param {Map} configMap 过滤器配置: Map, 每个键和对应元素如下
   * key: key即是需要过滤的字段名称
   * {
   *  type: 需要过滤的字段的类型, 字符串
   *  如果type === 'Number'
   *  那么存在以下两个必须字段
   *  min: 过滤通过区间的最小值
   *  max: 过滤通过区间的最大值
   * }
   */
  constructor (configMap) {
    this.configMap = configMap
  }

  /**
   * 检查输入的对象是否符合配置的要求
   * @param {*} obj 输入的对象
   */
  check (obj) {
    let res = true
    this.configMap.forEach((each, key, mapObj) => {
      if (obj[key] === undefined) {
        // 如果没有属性默认通过
        return
      }
      if (each.type === 'Number') {
        const value = obj[key]
        if (each.min !== null) {
          if (each.max !== null) {
            res = each.min <= value && value <= each.max
          } else {
            res = each.min <= value
          }
        } else {
          if (each.max !== null) {
            res = value <= each.max
          }
        }
      } else {
        throw Error('未知的过滤器类型:' + each.type)
      }
    })
    // 没有过滤器或者都通过
    return res
  }
}

export { Filter }
