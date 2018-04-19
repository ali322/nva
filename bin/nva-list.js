const chalk = require('chalk')
const config = require('../lib/config')

console.log('')
console.log('  Available Templates:')
console.log('')

for (let k in config.availableTemplates) {
  let template = config.availableTemplates[k]
  console.log(`  - ${chalk.cyan(template)}`)
}
console.log('')
