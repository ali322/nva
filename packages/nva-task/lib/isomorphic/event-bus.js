let EventEmitter = require('events')
let util = require('util')

function Bus() {
  EventEmitter.call(this)
}

util.inherits(Bus, EventEmitter)

module.exports = new Bus()