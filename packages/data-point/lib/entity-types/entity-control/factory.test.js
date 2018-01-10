/* eslint-env jest */

const Factory = require('./factory')

test('Factory#create', () => {
  const control = Factory.create({
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
    Factory.create({
      select: [{ case: 'a()', do: 'b()' }, { case: 'c()', do: 'd()' }]
    })
  }).toThrow(/missing|default/)
})
