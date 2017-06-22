let fork = require('child_process').fork

module.exports = function(path, signal) {
    function start() {
        const p = fork(path, process.argv.slice(2))
        p.on('message', function(data) {
            if (data === signal) {
                p.kill('SIGINT')
                start()
            }
        })
    }

    if (!process.send) {
        start()
    } else {
        require(path)
    }

    process.once('SIGINT', function(){
        process.exit(0)
    })
}