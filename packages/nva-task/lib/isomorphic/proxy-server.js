const { resolve } = require('path')
const http = require('http')
const { emojis } = require('nva-util')

const context = JSON.parse(process.env.context)
const options = JSON.parse(process.env.options)

const { protocol, hostname, port } = options
const { serverEntry, serverFolder } = context
let app = require(resolve(serverFolder, serverEntry))

app = app.callback ? app.callback() : app
http.createServer(app).listen(port, () => {
  console.log(
    `${emojis('rocket')}  server running at ${protocol}://${hostname}:${port}`
  )
})
