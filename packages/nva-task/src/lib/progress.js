let chalk = require('chalk')
let ProgressPlugin = require('webpack/lib/ProgressPlugin')
let log = require('log-update')
let figures = require('figures')
let path = require('path')

function now() {
    return new Date().toTimeString().split(' ')[0]
}

class Progress {
    constructor(options) {
        this.proxy = new ProgressPlugin(options)
    }
    apply(compiler) {
        this.proxy.apply(compiler)
        compiler.plugin('invalid', () => {
            console.log(chalk.white('Compiling...'))
        })
    }
}

function progressPlugin(minimal = false, options = {}) {
    let rootPath = path.resolve('.')
    let onStart = options.onStart || (() => {})
    let onFinish = options.onFinish || (() => {})
    let onProgress = options.onProgress || (() => {})
    let prevStep = 0
    let subPercentage
    let startTime
    let finishTime
    let duration

    return new Progress((percentage, message, moduleProgress, activeModules, moduleName) => {
        if (prevStep === 0) {
            startTime = Date.now()
        }
        let output = minimal ? [chalk.yellow(`[${Math.round(percentage * 100)}%] `)] : []

        if (percentage > 0 && percentage < 1) {
            onProgress(percentage)
        }

        // 1. compile
        if (percentage >= 0 && percentage < 0.1) {
            if (prevStep > 1) return
            prevStep = 1

            if (percentage === 0) onStart()

            output.push(chalk.white(minimal ? 'Compile modules...' : `${figures.pointer} Compile modules`))
        }
        if (percentage === 0.1 && !minimal) {
            output.push(`${figures.tick} Compile modules`)
        }
        // 2. build
        if (percentage >= 0.1 && percentage <= 0.7) {
            if (prevStep > 2) return
            prevStep = 2

            subPercentage = Math.round((percentage - 0.1) * 10000 / 60)
            output.push(chalk.white(minimal ? 'Build modules...' : `${figures.pointer} Build modules (${subPercentage}%)`))

            if (moduleName !== undefined) {
                let betterModuleName = moduleName
                // remove all details about used loaders
                if (betterModuleName.indexOf('!') !== -1) {
                    let splitModuleNames = betterModuleName.split('!')
                    betterModuleName = splitModuleNames[splitModuleNames.length - 1]
                }
                // transform to relative path
                if (betterModuleName.indexOf(rootPath) !== -1) {
                    betterModuleName = betterModuleName.split(rootPath)[1].substring(1)
                }
                // improve path
                // betterModuleName = betterModuleName.replace(/\\/g, '/').replace('./', '').replace('muti ', '')

                let [current, total] = moduleProgress.split('/')
                let moduleDetails = `${current} of ${total} :: ${betterModuleName}`
                output.push(chalk.grey(minimal ? `(${moduleDetails})` : `  ${figures.arrowRight} ${moduleDetails}`))
            }
        }
        if (percentage > 0.7 && !minimal) {
            output.push(`${figures.tick} Build modules`)
        }

        // 3. optimize
        if (percentage > 0.7 && percentage < 0.95) {
            if (prevStep > 3) return
            prevStep = 3
            subPercentage = Math.round((percentage - 0.71) * 10000 / 23)
            output.push(chalk.white(minimal ? 'Optimize modules...' : `${figures.pointer} Optimize modules (${subPercentage}%)`))
            let extraMsg = message + percentage === 0.91 ? ' -- may take long time' : ''
            output.push(chalk.grey(minimal ? extraMsg : `  ${figures.arrowRight} ${extraMsg}`))
        }
        if (percentage >= 0.95 && !minimal) {
            output.push(`${figures.tick} Optimize modules`)
        }

        // 4. emmit
        if (percentage >= 0.95 && percentage < 1) {
            if (prevStep > 4) return
            prevStep = 4
            output.push(chalk.white(minimal ? 'Emmit files...' : `  ${figures.pointer} Emmit files`))
        }
        if (percentage === 1 && !minimal) {
            output.push(`${figures.tick} Emmit files`)
        }

        // 5. finished
        if (percentage === 1) {
            prevStep = 0
            finishTime = Date.now()
            duration = (finishTime - startTime) / 1000
            duration = duration.toFixed(3)

            onFinish()
            output.push(chalk.white(`Build finished at ${now()} by ${duration}s`))
        }

        log(output.join(minimal ? '' : '\n'))
        if (percentage === 1) {
            log.done()
        }
    })
}

module.exports = progressPlugin