#!/usr/bin/env node
const program = require('commander')
const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const {generatorByFile, generatorByConfig, generatorByDir, combineByDir} = require('./utils')

program
  .version('1.1.1')
  .option('-i, --input <path>', 'config input path')
  .option('-o, --output <path>', 'config output path')
  .option('-p, --prefix <name>', 'config prefix words, default equal inputpath basename, valid only if inputpath is a file')
  .option('-t, --title <title>', 'config title, default equal prefix, valid only if inputpath is a file')
  .option('-d, --desc <desc>', 'config description, default equal title, valid only if inputpath is a file')
  .option('-C, --no-comb', 'don’t combi output')
  .option('-c, --config <path>', 'set config file path')
  .option('-m, --merge', 'merge dir to a json file')
program.parse(process.argv)

;(async () => {
  // 参数
  const {input = './', output = './snippets', prefix, title, desc, comb = true, merge = false} = program
  if (!fs.existsSync(output)) fs.mkdirSync(output)
  // 如果指定合并，不往下走(仅input,output,merge有效）
  if (merge) {
    const {pathname, data} = await combineByDir(input)
    let outpath = path.join(output, pathname)
    fs.writeFile(outpath, prettier.format(JSON.stringify(data || {}), {parser: 'json'}), err => {
      if (err) throw err
      console.log(`合并成功,文件${outpath}已生成`)
    })
    return
  }
  // 如果指定配置文件则按配置文件导出(仅output,config有效)
  if (program.config) {
    let config = require(program.config)
    let results = (await generatorByConfig(config)) || []
    results.forEach(({pathname, data}) => {
      let outpath = path.join(output, pathname)
      fs.writeFile(outpath, prettier.format(JSON.stringify(data || {}), {parser: 'json'}), err => {
        if (err) throw err
        console.log(`文件${outpath}已生成`)
      })
    })
    return
  }
  // 入口是否为目录类型
  let isDir = fs.statSync(input).isDirectory()
  if (isDir) {
    // 入口为目录(仅input,output,comb有效)
    let results = (await generatorByDir(input, comb)) || []
    results.forEach(({pathname, data}) => {
      let outpath = path.join(output, pathname)
      fs.writeFile(outpath, prettier.format(JSON.stringify(data || {}), {parser: 'json'}), err => {
        if (err) throw err
        console.log(`文件${outpath}已生成`)
      })
    })
  } else {
    // 这里不太严谨，就当是单文件好了
    const {pathname, data} = (await generatorByFile({file: input, title, prefix, desc})) || {}
    let outpath = path.join(output, pathname)
    fs.writeFile(outpath, prettier.format(JSON.stringify(data || {}), {parser: 'json'}), err => {
      if (err) throw err
      console.log(`文件${outpath}已生成`)
    })
  }
})()
