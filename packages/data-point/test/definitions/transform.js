module.exports = {
  'transform:a0': '$message',
  'transform:a1': [
    'transform:a0',
    (acc, next) => next(null, acc.value.toUpperCase())
  ],
  'transform:a2': [
    'transform:a0',
    acc => acc.resolveWith('resolved value'),
    (acc, next) => next(null, 'never returned value')
  ],
  'transform:a3': [
    'transform:a0',
    acc => acc.resolveWith('resolved value'),
    acc => 'some other value',
    acc => acc.resolveWith('never resolved value'),
    (acc, next) => next(null, 'never returned value')
  ]
}
