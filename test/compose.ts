import {
  collect,
  map,
  pull,
  values
} from '../index'

import {
  IStreamThrough
} from '../types'

import test = require('tape')

// test through streams compose on pipe!

test('join through streams with pipe', t => {
  const pipeline: IStreamThrough<string, string, Error> = pull<string, string, string, string, Error>(
    map((d: string) => {
      // make exciting!
      return `${d}!`
    }),
    map((d: string) => {
      // make loud
      return d.toUpperCase()
    }),
    map((d: string) => {
      // add sparkles
      return `*** ${d} ***`
    })
  )

  // the pipe line does not have a source stream.
  // so it should be a reader (function that accepts
  // a read function)

  // t.equal('function', typeof pipeline)
  // t.equal(1, pipeline.length)

  // if we pipe a read function to the pipeline,
  // the pipeline will become readable!

  const read = pull(
    values(['billy', 'joe', 'zeke']),
    pipeline
  )

  // t.equal('function', typeof read)
  // we will know it's a read function,
  // because read takes two args.
  // t.equal(2, read.length)

  pull(
    read,
    collect((_, array) => {
      // console.log(array)
      t.deepEqual(
        array, 
        [ '*** BILLY! ***', '*** JOE! ***', '*** ZEKE! ***' ]
      )
      t.end()
    })
  )

})
