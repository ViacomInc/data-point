const partition = require('lodash/partition')
const findLastIndex = require('lodash/findLastIndex')

const { getEntityObjects } = require('./utils')

function isMatchingKey (key, keys) {
  const id = key.type === 'Identifier' ? key.name : key.value
  return keys.includes(id)
}

module.exports = (file, api, options) => {
  const j = api.jscodeshift
  const root = j(file.source)

  function updateEntity (node, keys) {
    const entityProps = partition(node.value.properties, prop => {
      return isMatchingKey(prop.key, keys)
    })

    let props = entityProps[0]
    const otherProps = entityProps[1]

    if (props.length < 2) {
      return
    }

    props = keys.reduce((acc, key) => {
      const prop = props.find(p => isMatchingKey(p.key, [key]))
      if (prop) {
        acc.push(prop)
      }

      return acc
    }, [])

    const composeProp = j.property(
      'init',
      j.identifier('compose'),
      j.arrayExpression(
        props.map(prop => {
          return j.objectExpression([prop])
        })
      )
    )

    const index = findLastIndex(otherProps, prop => {
      return isMatchingKey(prop.key, ['inputType', 'before', 'value'])
    })

    if (index === -1) {
      node.value.properties = [composeProp].concat(otherProps)
    } else {
      otherProps.splice(index + 1, 0, composeProp)
      node.value.properties = otherProps
    }
  }

  function execute (entityId, keys) {
    const nodes = getEntityObjects(entityId, j, root)
    nodes[0].forEach(node => updateEntity(node, keys))
    nodes[1].forEach(node => updateEntity(node, keys))
  }

  execute('collection', ['filter', 'map', 'find'])
  execute('hash', ['omitKeys', 'pickKeys', 'mapKeys', 'addValues', 'addKeys'])

  return root.toSource()
}
