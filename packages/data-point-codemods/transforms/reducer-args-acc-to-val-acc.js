const util = require('util')
const _ = require('lodash')

module.exports = (file, api, options) => {
  const j = api.jscodeshift
  const root = j(file.source)

  function replaceWith (target, newObject) {
    for (let key in target) {
      delete target[key]
    }
    Object.assign(target, newObject)
  }

  function addValueParam (node) {
    const accReferences = j(node.value.body)
      .find(j.Identifier, {
        name: 'acc'
      })
      .size()

    let injectAcc = node.value.params.length === 2 || accReferences > 0

    const newParams = [
      {
        type: 'Identifier',
        name: 'value'
      }
    ]

    node.value.params = injectAcc
      ? newParams.concat(node.value.params)
      : newParams
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

  function checkValueVariable (node) {
    j(node)
      .find(j.Identifier, {
        name: 'value'
      })
      .forEach(nodePath => {
        const parentNode = nodePath.parentPath.value
        if (parentNode.type !== 'MemberExpression') {
          const nodeStart = parentNode.loc.start
          throw Error(
            util.format(
              'Refactor Reducer arguments (acc) -> (acc, value) Failed.',
              '\nA variable with name `value` already exists in the scope of a reducer function.',
              `\n\n${j(node).toSource()}`,
              `\n^------- ${file.path}:${nodeStart.line}:${nodeStart.column}`,
              "\n\nTry refactoring this block of code to remove any variable of name 'value' before running the codemod.\n\n"
            )
          )
        }
      })
  }

  function refactorReducer (node) {
    checkValueVariable(node)
    replaceAccValueReferences(node)
    addValueParam(node)
  }

  function isReducer (node) {
    const firstParam = _.get(node, 'params[0]', {})

    const isAcc = firstParam.type === 'Identifier' && firstParam.name === 'acc'

    if (!isAcc) {
      return false
    }

    if (node.params.length === 1) {
      return true
    }

    // reducers my only have max 2 arguments
    if (node.params.length > 2) {
      return false
    }

    const secondParam = _.get(node, 'params[1]', {})
    const secondParamIsCallback = j(node.body)
      .find(j.CallExpression, node => {
        return node.callee.name === secondParam.name
      })
      .size()

    if (secondParamIsCallback) {
      return true
    }

    return false
  }

  function refactorReducerMatches (nodeType) {
    root.find(nodeType, isReducer).forEach(refactorReducer)
  }

  refactorReducerMatches(j.FunctionDeclaration)
  refactorReducerMatches(j.ArrowFunctionExpression)
  refactorReducerMatches(j.FunctionExpression)

  return root.toSource()
}
