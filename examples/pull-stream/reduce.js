/* tslint:disable no-console */

const { 
  random, 
  range 
} = require('lodash')

const pull = require('pull-stream')

const array = range(parseInt(process.argv.slice(2)[0], 10))

const stream = pull(
  pull.values(array),
  pull.map(x => x + 1),
  pull.filter(x => x % 2 !== 0),
  pull.map(i => i + 1),
  pull.map(y => y + 1),
  pull.filter(x => x % 2 === 0),
  pull.reduce((x, y) => x + y, 0, (_, i) => {
    console.log(i)
    console.log('completed')
  })
)
