const prettyError = require('./pretty-error')
const helper = require('./helper')

module.exports = helper.merge(
  {
    prettyError
  },
  helper
)
