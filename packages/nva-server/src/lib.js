import PrettyError from 'pretty-error'

let pe = new PrettyError()

pe.appendStyle({
    'pretty-error > trace': {
        display: 'none'
    }
})

export function prettyError (e) {
    return pe.render(e)
}