const _ = require('lodash')

function getTransformKeys (data, path, keyPaths) {
  path = path || []
  keyPaths = keyPaths || []
  if (data instanceof Array) {
    let i
    const length = data.length
    for (i = 0; i <= length; i++) {
      const value = data[i]
      if (_.isPlainObject(value)) {
        getTransformKeys(value, path.concat(i), keyPaths)
      }
    }
  }

  if (_.isPlainObject(data)) {
    const keys = Object.keys(data)
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index]

      if (key.indexOf('$') === 0) {
        keyPaths.push({
          originalPath: path.concat(key),
          path: path.concat(key.slice(1)),
          value: data[key]
        })
        continue
      }

      getTransformKeys(data[key], path.concat(key), keyPaths)
    }
  }
  return keyPaths
}

module.exports.getTransformKeys = getTransformKeys
