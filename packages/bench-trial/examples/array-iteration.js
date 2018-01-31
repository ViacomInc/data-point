const { test } = require('bench-trial')

const array = Array(100).fill('foo')
const expected = array.join('').length

function forLoop () {
  let result = ''
  for (let index = 0; index < array.length; index++) {
    result = result + array[index]
  }

  const length = result.length
  result = ''
  return length
}

function whileLoop () {
  let result = ''
  let index = 0
  while (index !== array.length) {
    result = result + array[index]
    index++
  }

  const length = result.length
  result = ''
  return length
}

module.exports = [
  {
    async: false,
    name: 'while-loop',
    test: test(whileLoop, expected),
    benchmark: whileLoop
  },
  {
    async: false,
    name: 'for-loop',
    test: test(forLoop, expected),
    benchmark: forLoop
  }
]
