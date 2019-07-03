#!/usr/bin/env node
const program = require('commander')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const prettier = require("prettier")

program
  .version('1.0.1')
  .option('-i, --input <path>', 'config input path')
  .option('-o, --output <path>', 'config output path')
  .option('-p, --prefix <name>', 'config prefix words, default equal inputpath basename, valid only if inputpath is a file')
  .option('-t, --title <title>', 'config title, default equal prefix, valid only if inputpath is a file')
  .option('-d, --desc <desc>', 'config description, default equal title, valid only if inputpath is a file')
  .option('-C, --no-comb', 'don’t combi output')
program.parse(process.argv)

// 单个文件
const build = ({file, prefix, title, desc}) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('请先指定文件'))
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

;(async () => {
  // 参数
  const {input = './', output = './snippets', prefix, title, desc, comb = true} = program
  if (!fs.existsSync(input)) throw new Error('入口文件（夹）不存在')
  if (!fs.existsSync(output)) fs.mkdirSync(output)
  let isDir = fs.statSync(input).isDirectory()
  // 把单文件和多文件统一处理
  let files = isDir ? fs.readdirSync(input).map(v => path.join(input, v)) : [input]
  // return [{outpath: '', data: {}}]
  let results = await Promise.all(files.map(async file => {
    let basename = path.parse(file).name
    let outpath = path.join(output, `${basename}.json`)
    let data = await build(!isDir ? {file, prefix, title, desc} : {file})
    return {
      outpath,
      data
    }
  }))
  if (!comb || !isDir) {
    // 单文件或者不要comb
    results.forEach(({outpath, data}) => {
      fs.writeFile(outpath, prettier.format(JSON.stringify(data || {}), {parser: 'json'}), err => {
        if (err) throw err
        console.log(`${outpath}已生成`)
      })
    })
  } else {
    // 需要comb
    let basename = path.parse(input).name
    let outpath = path.join(output, `${basename}.json`)
    let combData = results.reduce((prev, {data = {}}) => Object.assign(prev, data), {})
    fs.writeFile(outpath, prettier.format(JSON.stringify(combData || {}), {parser: 'json'}), err => {
      if (err) throw err
      console.log(`${outpath}已生成`)
    })
  }
})()
