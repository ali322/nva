import PrettyError from 'pretty-error'
import { forEach } from 'lodash'

let pe = new PrettyError()

pe.appendStyle({
    'pretty-error > trace': {
        display: 'none'
    }
})

export function prettyError (e) {
    return pe.render(e)
}

export function isEq (targets, matches, wildcard = ":", cb = () => {}) {
    if (matches.length !== targets.length) return false
    let matched = false
    forEach(matches, (v, i) => {
        let target = targets[i]
        if (target.charAt(0) === wildcard) {
            matched = true
            cb(target, v)
            return true
        } else if (v === target) {
            matched = true
            return true
        } else {
            matched = false
            return false
        }
    })
    return matched
}