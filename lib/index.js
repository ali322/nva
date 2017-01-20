let inquirer = require('inquirer')
let chalk = require('chalk')

function ask(questions,stop,cb){
    inquirer.prompt(questions).then(function(answers){
        if(answers[stop]){
            cb(answers)
        }else{
            ask(questions)
        }
    })
}

function interceptOptions(options=[],allowed=[]){
    let unsuppored = options.filter((v)=>{
        return allowed.indexOf(v) === -1
    })
    if(unsuppored.length > 0){
        console.log(chalk.red(`unsuppored options: ${unsuppored.join(", ")}`))
        process.exit(1)
    }
}

module.exports = {
    ask,interceptOptions
}