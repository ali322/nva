const { join } = require("path")
const karma = require("karma")

module.exports = function (autowatch) {
  new karma.Server({
    configFile: join(__dirname, "karma.conf.js"),
    singleRun: !autowatch
  }).start()
}
