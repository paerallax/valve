import { filter } from './filter'
import { ValveError } from '../types'
import { identity, includes } from 'lodash'
import { Through } from '../internal/Through'

// drop items you have already seen

export function unique<P, K, E extends ValveError = ValveError>(
  test: ((next: P) => K) = identity,
  invert: boolean = false
): Through<P, P, E> {
  const seen: K[] = []

  return filter((next: P) => {
    const key = test(next)

    if (includes(seen, key)) {
      return !!Boolean(invert) // false, by default
    } else {
      seen.push(key)
    }

    return !Boolean(invert) // true by default
  })
}
