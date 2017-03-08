import * as frontend from "./frontend"
import * as isomorphic from "./isomorphic"
import {nvaConfig} from "./lib/helper"

const nvaType = nvaConfig()["type"]
let tasks = nvaType === 'isomorphic' ? isomorphic : frontend


export default tasks

