module.exports = (file, api, options) => {
  const j = api.jscodeshift
  const root = j(file.source)

  console.log('FILE PATH: %s\n', file.path)

  function replaceWith (target, newObject) {
    for (let key in target) {
      delete target[key]
    }
    Object.assign(target, newObject)
  }

  function addValueParam (node) {
    node.value.params = [
      {
        type: 'Identifier',
        name: 'value'
      }
    ].concat(node.value.params)
  }

  function replaceAccValueReferences (node) {
    // find all references to acc inside the function
    j(node)
      .find(j.MemberExpression, {
        object: {
          object: {
            name: 'acc'
          },
          property: {
            name: 'value'
          }
        }
      })
      .forEach(node => {
        node.value.object = {
          type: 'Identifier',
          name: 'value'
        }
      })

    // find all references to acc inside the function
    j(node)
      .find(j.MemberExpression, {
        object: {
          name: 'acc'
        },
        property: {
          name: 'value'
        }
      })
      .forEach(node => {
        replaceWith(node.value, {
          type: 'Identifier',
          name: 'value'
        })
      })

    return node.value
  }

  function refactorReducer (node) {
    replaceAccValueReferences(node)
    addValueParam(node)
  }

  function refactorReducerMatches (nodeType) {
    root
      .find(nodeType, {
        params: [
          {
            type: 'Identifier',
            name: 'acc'
          }
        ]
      })
      .forEach(refactorReducer)
  }

  refactorReducerMatches(j.FunctionDeclaration)
  refactorReducerMatches(j.ArrowFunctionExpression)
  refactorReducerMatches(j.FunctionExpression)

  console.log(root.toSource())
  console.log('\n^-------------------  %s\n\n', file.path)

  return root.toSource()
}
