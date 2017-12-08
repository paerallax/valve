import {
  collect,
  count,
  error,
  map,
  pull,
  through
} from '../index'

// tslint:disable-next-line no-import-side-effect
import 'mocha'
import { expect } from 'chai';

import {
  noop
} from 'lodash'

import {
  spy
} from 'sinon'

describe('test/continuable', () => {
  it('continuable stream', done => {
    // With values:
    const sA = spy()
    const sB = spy()
    const sC = spy()

    const stream = pull(
      count(5),
      map(item => {
        sA()

        return item * 2
      }),
      through(noop)
    )

    stream.source(null, (err, data) => {
      sB()

      expect(err).to.equal(null)
      expect(data).to.equal(2)
    })

    stream.source(null, (err, data) => {
      sC()

      expect(err).to.equal(null)
      expect(data).to.equal(4)
    })

    pull(
      stream,
      collect((err, ary) => {
        expect(sA.callCount).to.equal(5)
        expect(sB.callCount).to.equal(1)
        expect(sC.callCount).to.equal(1)
        expect(err).to.equal(null)
        expect(ary).to.deep.equal([6, 8, 10])
        done()
      })
    )
  })

  it('continuable stream (error)', done => {
    const ERR = new Error('test')

    const stream = pull(
      error(ERR),
      through(noop)
    )

    stream.source(null, (err, data) => {
      expect(err).to.equal(ERR)
      expect(data).to.equal(undefined)
    })

    stream.source(null, (err, data) => {
      expect(err).to.equal(ERR)
      expect(data).to.equal(undefined)
      done()
    })
  })
})