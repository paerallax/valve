/* tslint:disable no-circular-imports */

import {
  Stream,
  ValveError,
  ValveHandlerNoopPull,
  ValveSource,
  ValveSourceFactory,
  ValveType
} from '../types'

import { normalizeNoopPull, sourceActionsFactory } from './interface'
import { sourceOperator } from './operator'
import { Through } from './Through'
import { Sink } from './Sink'

// import { Functor } from '../../tmp/hkts/static-land'

// export interface Morphism<A, B> {
//   f: (_: A) => B
//   left: <C>(f: Morphism<C, A>) => Morphism<C, B>
//   right: <C>(f: Morphism<B, C>) => Morphism<A, C>
// }

export class Source<T, E extends ValveError = ValveError>
  implements ValveSourceFactory<T, E> {
  public type: ValveType.Source = ValveType.Source

  private value: ValveSource<T, E>

  // tslint:disable-next-line function-name
  public static create<_T, _E extends ValveError = ValveError>(
    handler?: ValveHandlerNoopPull<_T, _E>
  ) {
    return Source.of<_T, _E>(cb =>
      sourceOperator(normalizeNoopPull(handler, sourceActionsFactory(cb)))
    )
  }

  // tslint:disable-next-line function-name
  public static of<_T, _E extends ValveError = ValveError>(
    value: ValveSource<_T, _E>
  ) {
    return new Source<_T, _E>(value)
  }

  constructor(value: ValveSource<T, E>) {
    this.value = value
  }

  public pipe() {
    return this.value
  }

  public map<_R>(
    fn: (value: ValveSource<T, E>) => ValveSource<_R, E>
  ): Source<_R, E> {
    return Source.of(fn(this.value))
  }

  public ap<_X>(value: Sink<T, _X, E>): Stream<_X, E>
  public ap<_X>(value: Through<T, _X, E>): Source<_X, E>
  public ap<_X>(
    value: Through<T, _X, E> | Sink<T, _X, E>
  ): Source<_X, E> | Stream<_X, E> {
    switch (value.type) {
      case ValveType.Through: {
        return value.ap(this)
      }

      case ValveType.Sink: {
        return value.pipe()(this.pipe())
      }
    }
  }
}
