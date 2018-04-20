import test from 'ava'
import { devMacro } from '../fixture/macro'

test.serial.cb(
    `frontend-boilerplate#master dev`,
    devMacro,
    'frontend-boilerplate',
    'master'
)
test.serial.cb(
    `frontend-boilerplate#spa dev`,
    devMacro,
    'frontend-boilerplate',
    'spa'
)
test.serial.cb(
    `frontend-boilerplate#vue-spa dev`,
    devMacro,
    'frontend-boilerplate',
    'vue-spa'
)
test.serial.cb(
    `frontend-boilerplate#vue dev`,
    devMacro,
    'frontend-boilerplate',
    'vue'
)
test.serial.cb(
    `ssr-boilerplate#master dev`,
    devMacro,
    'ssr-boilerplate',
    'master'
)
test.serial.cb(
    `ssr-boilerplate#spa dev`,
    devMacro,
    'ssr-boilerplate',
    'spa'
)
test.serial.cb(
    `ssr-boilerplate#vue-spa dev`,
    devMacro,
    'ssr-boilerplate',
    'vue-spa'
)
test.serial.cb(
    `ssr-boilerplate#vue dev`,
    devMacro,
    'ssr-boilerplate',
    'vue'
)
