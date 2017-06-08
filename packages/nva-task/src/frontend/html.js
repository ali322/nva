var fs = require('fs-extra'),
    path = require('path')

function InjectHtmlWebpackPlugin(options) {
    this.options = options
    options.chunks = options.chunks || []
    options.more = options.more || {}
    options.startInjectJS = options.startInjectJS || '<!-- start:js -->'
    options.endInjectJS = options.endInjectJS || '<!-- end:js -->'
    options.startInjectCSS = options.startInjectCSS || '<!-- start:css -->'
    options.endInjectCSS = options.endInjectCSS || '<!-- end:css -->'
    options.processor = options.processor || ''
    options.customInject = options.customInject || []
    this.runing = false
}

function assetsOfChunks(namedChunks, selected) {
    var assets = {
        js: [],
        css: []
    }
    var chunks = []
    selected.forEach(function(chunkName) {
        chunks = chunks.concat(namedChunks[chunkName] && namedChunks[chunkName].files || [])
    })
    chunks.forEach(function(v) {
        if (/\.js$/.test(v)) {
            assets.js.push(v)
        } else if (/\.css$/.test(v)) {
            assets.css.push(v)
        }
    })
    return assets
}

function injectWithin(html, startIdentifier, endIdentifier, content, purified) {
    var startIndex = html.indexOf(startIdentifier),
        endIndex = html.indexOf(endIdentifier)
    if (startIndex < 0 || endIndex < 0) {
        return html
    }
    var previousInnerContent = html.substring(startIndex + startIdentifier.length, endIndex)
    var ident = leadingWhitespace(previousInnerContent)
    ident = ident.replace(/(\n[\s|\t]*\r*\n)/g,'\n')
    var toInject = Array.isArray(content) ? content.slice() : [content]
    purified ? toInject.unshift(html.substr(0, startIndex)) :
        toInject.unshift(html.substr(0, startIndex + startIdentifier.length))
    purified ? toInject.push(html.substr(endIndex + endIdentifier.length)) : toInject.push(html.substr(endIndex))
    return toInject.join(ident)
}

function applyProcessor(originURL, processor) {
    var _url = originURL
    if (typeof processor === 'string') {
        _url = processor + originURL
    } else if (typeof processor === 'function') {
        typeof processor(originURL) === 'string' && (_url = processor(originURL))
    }
    return _url
}

function leadingWhitespace(str) {
    return str.match(/^\s*/)[0]
}

InjectHtmlWebpackPlugin.prototype.apply = function(compiler) {
    var that = this
    var options = that.options
    var filename = options.filename
    var output = (typeof options.output === 'string' ? options.output : false)
    var purified = !!output
    var selected = options.chunks
    var more = options.more
    var processor = options.processor
    var startInjectJS = options.startInjectJS,
        endInjectJS = options.endInjectJS,
        startInjectCSS = options.startInjectCSS,
        endInjectCSS = options.endInjectCSS
    var customInject = options.customInject
    compiler.plugin('emit', function(compilation, callback) {
        var namedChunks = compilation.namedChunks
        var _html
        if (that.runing) {
            callback()
            return
        }
        if (!options.filename) {
            callback()
            return
        }
        var assets = assetsOfChunks(namedChunks, selected)

        var jsLabel = assets['js'].map(function(v) {
            return '<script src="' + applyProcessor(v, processor) + '"></script>'
        })
        var cssLabel = assets['css'].map(function(v) {
            return '<link rel="stylesheet" href="' + applyProcessor(v, processor) + '"/>'
        })
        if (more) {
            if (Array.isArray(more.js)) {
                for (var i = 0; i < more.js.length; i++) {
                    jsLabel.unshift('<script src="' + more.js[i] + '"></script>')
                }
            }
            if (Array.isArray(more.css)) {
                for (var j = 0; j < more.css.length; j++) {
                    cssLabel.unshift('<link rel="stylesheet" href="' + more.css[j] + '"/>')
                }
            }
        }
        if (output) {
            try {
                fs.copySync(filename, output)
                filename = output
            } catch (e) {
                compilation.errors.push(new Error('InjectHtmlWebpackPlugin copy filename to output failed'))
            }
        }
        try{
            _html = fs.readFileSync(filename, 'utf8')
        }catch(e){
            compilation.errors.push(new Error('InjectHtmlWebpackPlugin read filename failed'))
            callback()
            return
        }
        _html = injectWithin(_html, startInjectJS, endInjectJS, jsLabel, purified)
        _html = injectWithin(_html, startInjectCSS, endInjectCSS, cssLabel, purified)
        console.log('jsLabel',jsLabel,_html)

        customInject.forEach(function(inject) {
            var _startIdentifier = inject.start,
                _endIdentifier = inject.end,
                _content = inject.content
            if (!_startIdentifier || !_endIdentifier) {
                return
            }
            _html = injectWithin(_html, _startIdentifier, _endIdentifier, _content, purified)
        })
        fs.writeFileSync(filename, _html)
        that.runing = true
        callback()
    })
}

module.exports = InjectHtmlWebpackPlugin