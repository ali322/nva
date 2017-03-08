import os from 'os'
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'

const NVA_PATH = '.nva'
const MODULE_CONFIG_FILE = path.join(process.cwd(), NVA_PATH,'module.json')
const NVA_CONFIG_FILE = path.join(process.cwd(), NVA_PATH ,'nva.json')
const VENDOR_CONFIG_FILE = path.join(process.cwd(), NVA_PATH,'vendor.json')
const WEBPACK_CONFIG_FILE = path.join(process.cwd(),NVA_PATH,'webpack.config.js')

export function getLanIP() {
    let interfaces = os.networkInterfaces();
    let IPv4 = '127.0.0.1';
    for (let key in interfaces) {
        interfaces[key].forEach(function(details) {
            if (details.family == 'IPv4' && /^en\d{1}$/.test(key) === true) {
                IPv4 = details.address;
            }
        });
    }
    return IPv4;
}

export function bundleTime() {
    const dateObj = new Date()
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1
    const date = dateObj.getDate()
    const hour = dateObj.getHours()
    const minute = dateObj.getMinutes()
    return "" + year + month + date + hour + minute
}

export function urlResolver(originURL, from, to, input) {
    var _url = path.join(path.relative(from, input), originURL)
    if (/node_modules/.test(from)) {
        _url = originURL
    }
    return _url
}

export function nvaConfig() {
    let nvaConfig
    fs.existsSync(NVA_CONFIG_FILE) && (nvaConfig = JSON.parse(fs.readFileSync(NVA_CONFIG_FILE, 'utf8')))
    return nvaConfig
}



export function moduleConfig() {
    let moduleConfig
    fs.existsSync(MODULE_CONFIG_FILE) && (moduleConfig = JSON.parse(fs.readFileSync(MODULE_CONFIG_FILE, 'utf8')))
    return moduleConfig
}

export function writeToModuleConfig(config) {
    try {
        fs.existsSync(MODULE_CONFIG_FILE) && fs.writeFileSync(MODULE_CONFIG_FILE, JSON.stringify(config, null, 2))
    } catch (e) {
        return false
    }
    return true
}

export function vendorConfig() {
    let vendorConfig
    fs.existsSync(VENDOR_CONFIG_FILE) && (vendorConfig = JSON.parse(fs.readFileSync(VENDOR_CONFIG_FILE, 'utf8')))
    return vendorConfig
}

export function webpackConfig(){
    let webpackConfig = {}
    fs.existsSync(WEBPACK_CONFIG_FILE) && (webpackConfig = require(WEBPACK_CONFIG_FILE))
    return webpackConfig
}

export function checkManifest(path){
    if(!fs.existsSync(path)){
        console.log(chalk.red('vendor manifest not found,did you forget run `nva vendor`?'))
        process.exit(1)
    }
}