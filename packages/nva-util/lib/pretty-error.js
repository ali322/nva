const PrettyError = require('pretty-error')

const pe = new PrettyError()

pe.appendStyle({
  'pretty-error > trace': {
    display: 'none'
  }
})

module.exports = function prettyError (e) {
  return pe.render(e)
}