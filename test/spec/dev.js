import test from 'ava'
import { devMacro } from '../fixture/macro'

test.serial.cb(`frontend-boilerplate#master dev`, devMacro, 'master')
// test.serial.cb(`frontend-boilerplate#spa dev`, devMacro, 'spa')
// test.serial.cb(`frontend-boilerplate#vue-spa dev`, devMacro, 'vue-spa')
// test.serial.cb(`frontend-boilerplate#vue dev`, devMacro, 'vue')
