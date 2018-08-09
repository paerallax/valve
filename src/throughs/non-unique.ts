import { unique } from './unique'

import { ValveError, ValveThroughFactory } from '../types'

export function nonUnique<P, K, E extends ValveError = ValveError>(
  iteratee?: ((data: P) => K)
): ValveThroughFactory<P, P, {}, E> {
  return unique(iteratee, true)
}
