/* tslint:disable no-any */

import {
  ValveCallback,
  ValveError,
  ValveHandlerNoopNoop,
  ValveHandlerPullPull,
  ValveSource,
  ValveSourceMessage,
  ValveThrough,
  ValveThroughFactory,
  ValveType
} from '../types'

import {
  normalizeNoopNoop,
  normalizePullPull,
  sinkActionFactory,
  sourceActionsFactory
} from './interface'

import { sinkOperator, sourceOperator } from './operator'

const sourceMiddlewareFactory = <T, E>(
  sinkHandler?: ValveHandlerPullPull<E>
) => (cb: ValveCallback<T, E>): ValveCallback<T, E> => {
  if (sinkHandler === undefined) {
    return cb
  } else {
    return sourceOperator(normalizePullPull(sinkHandler, sinkActionFactory(cb)))
  }
}

const sinkMiddlewareFactory = <T, R, E>(
  sourceHandler?: ValveHandlerNoopNoop<T, R, E>
) => (middleware: (cb: ValveCallback<T, E>) => ValveCallback<T, E>) => (
  source: ValveSource<T, E>
) => (cb: ValveCallback<R, E, ValveSourceMessage>) => {
  if (sourceHandler !== undefined) {
    const operator = sinkOperator(
      normalizeNoopNoop(sourceHandler, sourceActionsFactory(cb))
    )

    return middleware(source(operator))
  }

  return middleware(source(cb as any))
}

export class Through<T, R = T, E extends ValveError = ValveError>
  implements ValveThroughFactory<T, R, E> {
  public type: ValveType.Through = ValveType.Through

  private value: ValveThrough<T, R, E>

  // tslint:disable-next-line function-name
  public static create<_T, _R = _T, _E extends ValveError = ValveError>(
    sourceHandler?: ValveHandlerNoopNoop<_T, _R, _E>,
    sinkHandler?: ValveHandlerPullPull<_E>
  ) {
    if (sourceHandler === undefined && sinkHandler === undefined) {
      return new Through<_T, _R, _E>(source => source as ValveSource<_R, _E>)
    } else {
      const sourceMiddleware = sourceMiddlewareFactory<_T, _E>(sinkHandler)
      const sinkMiddleware = sinkMiddlewareFactory<_T, _R, _E>(sourceHandler)

      return Through.of<_T, _R, _E>(sinkMiddleware(sourceMiddleware))
    }
  }

  // tslint:disable-next-line function-name
  public static of<_T, _R = _T, _E extends ValveError = ValveError>(
    value: ValveThrough<_T, _R, _E>
  ) {
    return new Through<_T, _R, _E>(value)
  }

  constructor(value: ValveThrough<T, R, E>) {
    this.value = value
  }

  public pipe() {
    return this.value
  }
}
