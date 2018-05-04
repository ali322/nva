module.exports = {
  type: {
    type: 'list',
    message: 'which type of project?',
    choices: ['frontend', 'isomorphic']
  },
  framework: {
    type: 'list',
    message: 'which framework to use?',
    choices: ['react', 'vue']
  },
  useMobx: {
    when: function (answers) {
      return answers.framework === 'react'
    },
    type: 'confirm',
    message: 'use mobx instead of redux'
  },
  spa: {
    type: 'confirm',
    message: 'is an spa application?'
  },
  offline: {
    type: 'confirm',
    message: 'enable offline feature?'
  },
  version: {
    type: 'input',
    message: 'project version',
    default: '0.0.1'
  },
  desc: {
    type: 'input',
    message: 'project description'
  },
  author: {
    type: 'input',
    message: 'project author'
  },
  respository: {
    type: 'input',
    message: 'project respository url'
  },
  license: {
    type: 'input',
    message: 'project license',
    default: 'MIT'
  },
  yes: {
    type: 'confirm',
    message: 'Are your sure about above answers?'
  }
}
