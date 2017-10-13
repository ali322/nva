let chromedriver = require('chromedriver')

module.exports = {
  before (done) {
    chromedriver.start()
    done()
  },
  after (done) {
    chromedriver.stop()
    done()
  },
  afterEach (browser, done) {
    process.nextTick(() => {
      browser.end(() => {
        done()
      })
    })
  }
}
