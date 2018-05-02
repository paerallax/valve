import { collect, error, flatten, fromIterable, through, valve } from '../index'

import { ValveActionType } from '../types'

import { createSink } from '../utilities'

// tslint:disable-next-line no-import-side-effect
import 'mocha'
import { expect } from 'chai'

describe('throughs/flatten', () => {
  it('stream of arrays of numbers', done => {
    valve(
      fromIterable([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
      flatten(),
      collect({
        onData(action) {
          expect(action.payload).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9])

          done()
        }
      })
    )
  })

  it('stream of arrays of string', done => {
    valve(
      fromIterable([['a', 'b', 'c'], ['d', 'e', 'f']]),
      flatten(),
      collect({
        onData(action) {
          expect(action.payload).to.deep.equal(['a', 'b', 'c', 'd', 'e', 'f'])

          done()
        }
      })
    )
  })

  it('stream of number streams', done => {
    valve(
      fromIterable([fromIterable([1, 2, 3]), fromIterable([4, 5, 6]), fromIterable([7, 8, 9])]),
      flatten(),
      collect({
        onData(action) {
          expect(action.payload).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9])

          done()
        }
      })
    )
  })

  it('stream of string streams', done => {
    valve(
      fromIterable([fromIterable(['a', 'b', 'c']), fromIterable(['d', 'e', 'f'])]),
      flatten(),
      collect({
        onData(action) {
          expect(action.payload).to.deep.equal(['a', 'b', 'c', 'd', 'e', 'f'])

          done()
        }
      })
    )
  })

  it('through', done => {
    valve(
      fromIterable([fromIterable([1, 2, 3]), fromIterable([4, 5, 6]), fromIterable([7, 8, 9])]),
      // tslint:disable-next-line no-empty
      through(),
      flatten(),
      collect({
        onData(action) {
          expect(action.payload).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9])

          done()
        }
      })
    )
  })

  it('broken stream', done => {
    const err = new Error('I am broken')

    valve(
      fromIterable([error(err)]),
      flatten(),
      createSink({
        onError(action) {
          expect(action.payload).to.equal(err)
          setImmediate(() => {
            expect(action.payload).to.equal(err) // should abort stream of streams
            done()
          })
        }
      })
    )
  })

  it('abort', done => {
    let s1Ended: {}
    let s2Ended: {}
    let s3Ended: {}

    const stream = valve(
      valve(
        fromIterable([
          valve(
            fromIterable([1, 2]),
            through({
              onAbort(action) {
                s1Ended = action
              }
            })
          ),
          valve(
            fromIterable([3, 4]),
            through({
              onAbort(action) {
                s2Ended = action
              }
            })
          )
        ]),
        through({
          onAbort(action) {
            s3Ended = action
          }
        })
      ),
      flatten()
    )

    stream.source({ type: ValveActionType.Pull }, act => {
      if (act.type !== ValveActionType.Noop) {
        done(new Error('Action type mismatch'))
      } else {
        stream.source({ type: ValveActionType.Pull }, action => {
          if (action.type === ValveActionType.Data) {
            expect(action.payload).to.equal(1)
          } else {
            done(new Error('Action type mismatch'))
          }

          stream.source({ type: ValveActionType.Abort }, _action => {
            expect(_action.type).to.equal(ValveActionType.Abort)

            setImmediate(() => {
              expect(s3Ended).to.deep.equal({ type: ValveActionType.Abort }) // should abort stream of streams
              expect(s1Ended).to.deep.equal({ type: ValveActionType.Abort }) // should abort current nested stream
              expect(s2Ended).to.equal(undefined) // should not abort queued nested stream
              done()
            })
          })
        })
      }
    })
  })

  it('abort before first read', done => {
    let sosEnded: {}
    let s1Ended: {}

    // const stream = pull(
    //   pull(
    //     fromIterable([
    //       pull(fromIterable([1, 2]), through())
    //     ]),
    //     through(undefined, act => (sosEnded = act))
    //   ),
    //   flatten()
    // )

    const stream = valve(
      valve(
        fromIterable([
          valve(
            fromIterable([1, 2]),
            through({
              onAbort(action) {
                s1Ended = action
              }
            })
          )
        ]),
        through({
          onAbort(action) {
            sosEnded = action
          }
        })
      ),
      flatten()
    )

    stream.source({ type: ValveActionType.Abort }, action => {
      expect(action.type).to.equal(ValveActionType.Abort)

      setImmediate(() => {
        expect(sosEnded).to.deep.equal({ type: ValveActionType.Abort }) // should abort stream of streams
        expect(s1Ended).to.equal(undefined) // should abort current nested stream
        done()
      })
    })
  })

  it('flattern handles stream with normal objects', done => {
    valve(
      fromIterable([[1, 2, 3], 4, [5, 6, 7], 8, 9, 10]),
      flatten(),
      collect({
        onData(action) {
          expect(action.payload).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

          done()
        }
      })
    )
  })

  it('flattern handles stream mixed objects', done => {
    valve(
      fromIterable([[1, 2, 3], 4, fromIterable([5, 6, 7]), 8, 9, 10]),
      flatten(),
      collect({
        onData(action) {
          expect(action.payload).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

          done()
        }
      })
    )
  })
})
