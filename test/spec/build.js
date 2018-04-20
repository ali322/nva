import test from 'ava'
import { buildMacro } from '../fixture/macro'

test.serial.cb(
    `frontend-boilerplate#master build`,
    buildMacro,
    'frontend-boilerplate',
    'master'
)
test.serial.cb(
    `frontend-boilerplate#spa build`,
    buildMacro,
    'frontend-boilerplate',
    'spa'
)
test.serial.cb(
    `frontend-boilerplate#vue-spa build`,
    buildMacro,
    'frontend-boilerplate',
    'vue-spa'
)
test.serial.cb(
    `frontend-boilerplate#vue build`,
    buildMacro,
    'frontend-boilerplate',
    'vue'
)
test.serial.cb(
    `ssr-boilerplate#master build`,
    buildMacro,
    'ssr-boilerplate',
    'master'
)
test.serial.cb(
    `ssr-boilerplate#spa build`,
    buildMacro,
    'ssr-boilerplate',
    'spa'
)
test.serial.cb(
    `ssr-boilerplate#vue-spa build`,
    buildMacro,
    'ssr-boilerplate',
    'vue-spa'
)
test.serial.cb(
    `ssr-boilerplate#vue build`,
    buildMacro,
    'ssr-boilerplate',
    'vue'
)
