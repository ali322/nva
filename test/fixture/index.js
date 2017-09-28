let path = require('path')
let fs = require('fs-extra')
let generator = require('../../lib/generator')

let answers = {
  template: 'frontend',
  framework: 'react',
  spa: true,
  version: '0.0.1',
  desc: '',
  author: '',
  respository: '',
  license: 'MIT',
  yes: true
}
let tempDir = path.join('temp', 'mock-project')
let projectPath = path.join(tempDir, 'test')

function setup () {
  if (!fs.existsSync(projectPath)) {
    return generator('test', projectPath, answers, null, true)
  }
}

function teardown () {
  fs.removeSync('temp')
}

let constants = { projectPath }

module.exports = { setup, teardown, constants }
