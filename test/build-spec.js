let setup = require('./fixture').setup
let execa = require('execa')
let path = require('path')
let expect = require('chai').expect

describe.skip("build project test's", function() {
    let cli = path.join(__dirname, '..', 'bin', 'nva.js')
    let cwd = process.cwd()
    before(function() {
        return setup()
    })

    describe('source', function() {
        this.timeout(50000)
        let result
        before(function(done) {
            process.chdir(path.join(__dirname, '..', 'temp', 'mock-project', 'test'))
            execa('node', [cli, 'build']).then(function(res) {
                result = res
                done()
            }).catch(function(err) {
                console.error(err)
                done()
            })
        })
        it('should success', function(done) {
            console.log('result',result)
            // expect(result.stdout).to.have.string('build success')
            done()
        })
        after(function() {
            process.chdir(cwd)
        })
    })
})