let PrettyError = require('pretty-error')

let pe = new PrettyError()

pe.appendStyle({
  'pretty-error > trace': {
    display: 'none'
  }
})

module.exports = function prettyError (e) {
  return pe.render(e)
}