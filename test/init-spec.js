let expect = require("chai").expect
let fs = require("fs-extra")
let path = require("path")
let constants = require("./fixture").constants

describe("init", function() {
  this.timeout(100000)

  it("generate correctly project", function() {
    expect(fs.existsSync(constants.projectPath)).to.true
    expect(fs.existsSync(path.join(constants.projectPath, "src"))).to.true
    let pkg = fs.readJSONSync(path.join(constants.projectPath, "package.json"))
    expect(pkg.name).to.equal("test")
  })
})
