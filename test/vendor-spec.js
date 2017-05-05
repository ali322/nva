let setup = require('./fixture').setup
let execa = require('execa')
let path = require('path')
let expect = require('chai').expect

describe("build project test's", function() {
    let cli = path.join(__dirname, '..', 'bin', 'nva.js')
    let cwd = process.cwd()
    this.timeout(100000)

    describe('vendor', function() {
        let result
        before(function(done) {
            process.chdir(path.join(__dirname, '..', 'temp', 'mock-project', 'test'))
            execa('node', [cli, 'vendor']).then(function(res) {
                result = res
                done()
            }).catch(function(err) {
                console.error(err)
                done()
            })
        })
        it('should success', function(done) {
            expect(result.stdout).to.have.string('build vendor success')
            done()
        })
        after(function() {
            process.chdir(cwd)
        })
    })
})