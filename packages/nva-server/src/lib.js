import PrettyError from 'pretty-error'

let pe = new PrettyError()

pe.appendStyle({
    'pretty-error > trace': {
        display: 'none'
    }
})

export { pe }