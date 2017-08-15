let fork = require('child_process').fork

module.exports = (path, signal) => {
    let p
    function start() {
        p = fork(path, process.argv.slice(2))
        p.on('message', (data) => {
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

    function clean() {
        p.kill('SIGINT')
        process.exit(0)
    }

    process.once('SIGINT', clean)
    process.once('SIGTERM', clean)
}