/* eslint-env jest */

const Factory = require('./factory')
const createReducer = require('../../reducer-types').create

test('Factory#create', () => {
  const control = Factory.create(createReducer, {
    select: [
      { case: '$a', do: '$b' },
      { case: '$c', do: '$d' },
      { default: '$e' }
    ]
  })

  expect(control).not.toHaveProperty('before')
  expect(control).not.toHaveProperty('after')
  expect(control).not.toHaveProperty('error')
  expect(control).toHaveProperty('params')
  expect(control).toHaveProperty('select')
})

test('Factory#create enforce default statement', () => {
  expect(() => {
    Factory.create(createReducer, {
      select: [{ case: 'a()', do: 'b()' }, { case: 'c()', do: 'd()' }]
    })
  }).toThrow(/missing|default/)
})
