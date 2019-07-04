const fs = require('fs')
const path = require('path')
const util = require('util')
const readline = require('readline')
const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)

/**
 * 根据参数生成data
 * @param {Object} param
 */
const generator = ({file, title, prefix, desc}) => {
  return new Promise((resolve, reject) => {
    if (!file || !fs.existsSync(file)) return reject(new Error('请先指定文件'))
    prefix = prefix || path.parse(file).name
    let rl = readline.createInterface({
      input: fs.createReadStream(file)
    })
    let body = []
    let result = {}
    rl.on('line', data => body.push(data))
    rl.on('close', () => {
      result[title || prefix] = {
        prefix,
        body,
        description: desc || title || prefix
      }
      resolve(result)
    })
  })
}

/**
 * 单个文件生成json
 * @param {Object} param
 */
const generatorByFile = ({file, title, prefix, desc}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {name} = path.parse(file)
      let data = await generator({file, title, prefix, desc})
      resolve({pathname: `${name}.json`, data})
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 入口是个config
 * @param {Object} config
 */
const generatorByConfig = config => {
  return new Promise(async (resolve, reject) => {
    if (!config) return reject(new Error('未指定配置文件'))
    let targets = Object.keys(config).map(k => {
      const {type = 'javascript', prefix, body, description} = config[k]
      return {
        file: body,
        title: k,
        prefix,
        desc: description,
        type
      }
    })
    try {
      let resultsArr = await Promise.all(targets.map(v => generator(v)))
      // 根据type分组
      let results = resultsArr.reduce((prev, cur, i) => {
        const {type} = targets[i]
        let pathname = `${type}.json`
        let curItem = prev.find(v => v.pathname === pathname)
        curItem ? (curItem.data = Object.assign({}, curItem.data, cur)) : prev.push({pathname, data: cur})
        return prev
      }, [])
      resolve(results)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 入口是个目录
 * @param {String} dir 目录
 * @param {Boolean} isComb 是否合并
 */
const generatorByDir = (dir, isComb) => {
  return new Promise(async (resolve, reject) => {
    if (!dir || !fs.existsSync(dir)) return reject(new Error('当前目录不存在'))
    let dirname = path.parse(dir).name
    let targets = (await readdir(dir) || []).map(v => {
      const {name} = path.parse(v)
      return {
        file: path.join(dir, v),
        title: name,
        prefix: name,
        desc: name
      }
    })
    try {
      let resultArr = await Promise.all(targets.map(v => generator(v)))
      isComb ? resolve([{pathname: `${dirname}.json`, data: resultArr.reduce((prev, cur) => Object.assign({}, prev, cur), {})}]) : resolve(targets.map((v, i) => ({pathname: `${v.title}.json`, data: resultArr[i]})))
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 根据目录合并json文件
 * @param {String} dir 
 */
const combineByDir = dir => {
  return new Promise(async (resolve, reject) => {
    if (!dir || !fs.existsSync(dir)) return reject(new Error('当前目录不存在'))
    try {
      let files = ((await readdir(dir)) || []).map(v => path.join(dir, v))
      let results = await Promise.all(files.map(v => readFile(v)))
      const {name} = path.parse(dir)
      let data = results.reduce((prev, cur) => Object.assign({}, prev, JSON.parse(cur || '{}')), {})
      resolve({pathname: `${name}.json`, data})
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  generator,
  generatorByFile,
  generatorByConfig,
  generatorByDir,
  combineByDir
}