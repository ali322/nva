const EventEmitter = require('events')
const util = require('util')

function Bus() {
  EventEmitter.call(this)
}

util.inherits(Bus, EventEmitter)

module.exports = new Bus()