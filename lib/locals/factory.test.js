/* eslint-env jest */
'use strict'

const LocalsFactory = require('./factory')

test('locals#create', () => {
  const expected = {
    some: 'value'
  }

  const locals = LocalsFactory.create(expected)
  expect(locals).toEqual(expected)
})
