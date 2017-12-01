module.exports = {
  'transform:a0': '$message',
  'transform:a1': [
    'transform:a0',
    (acc, next) => next(null, acc.value.toUpperCase())
  ]
}
