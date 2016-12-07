var chalk = require("chalk")
var config = require("../lib/config")

console.log('')
console.log('  Available Templates:')
console.log('')

for(var k in config.availableTemplates){
    var _template = config.availableTemplates[k]
    console.log(`  - ${chalk.cyan(_template)}`)
}
console.log('')