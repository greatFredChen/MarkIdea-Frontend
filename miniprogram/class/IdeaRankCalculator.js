class IdeaRankCalculator {
  // 计算对象rank类
  /**
   *
   * @param {*} weights 字典, 各个指标的权重, 求和为1
   * @param {*} map 字典, 每个指标的map计算, 计算前简单的数据处理, 比如取负数, 乘以一个数等
   * @param {Number} rate 不同值最终大小的差异, rate越大, 同样的差距, rank差距越大
   */
  constructor (weights, map, rate = 1) {
    this.weights = weights
    this.rate = rate
    this.map = map
  }

  /**
   * logistic 计算
   * @param {*} x
   */
  _logistic (x) {
    // logistic函数
    return 1 / (1 + Math.exp(-1 * this.rate * x))
  }

  /**
   * 计算输入idea对象列表对象集合的所有对象的rank值, 返回rank列表, 下标一一对应
   * @param {*} ideaList
   */
  getIdeasRank (ideaList) {
    if (ideaList.length <= 0) {
      return []
    }
    const rank = (new Array(ideaList.length)).fill(0)
    // 归一化
    for (const metricType in this.weights) {
      // 平均值
      let mean = 0
      // 标准差
      let std = 0
      let data = new Array(ideaList.length)
      const mapFunc = this.map[metricType]
      for (let i = 0; i < data.length; i++) {
        const idea = ideaList[i] // 注意这里的是idea对象
        let num = idea[metricType] ? Number(idea[metricType]) : 0
        num = mapFunc ? mapFunc(num) : num
        data[i] = num
        mean += num
      }
      // 每个指标计算
      mean /= data.length
      for (let i = 0; i < data.length; i++) {
        const num = data[i] - mean
        std += num * num
      }
      if (std === 0) {
        data = (new Array(data.length)).fill(0.5)
      } else {
        std = Math.sqrt(std) / ideaList.length
        data = data.map((ele, index) => {
          return this._logistic((ele - mean) / std)
        })
      }
      // 每个指标计算
      for (let i = 0; i < data.length; ++i) {
        rank[i] += data[i] * this.weights[metricType]
      }
    }
    // console.log('res')
    // console.log(rank)
    return rank
  }
}

export { IdeaRankCalculator }
