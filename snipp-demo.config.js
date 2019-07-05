/**
 * 配置文件
 * * 类比snippets默认json，区别body为code path而不是code body
 * * @prefix设置简写，不写的话默认文件名
 * * @body设置源代码路径
 * * @description同snippets，描述
 * * @type为代码类型，会根据类型合并生成对应的代码片段json，如javascript.json
 */
module.exports = {
  'a demo title': {
    body: './codes/a.js',
    description: 'a demo description',
    type: 'javascript'
  },
  'a demo b': {
    prefix: 'adb',
    body: './codes/b.css',
    type: 'css'
  }
}