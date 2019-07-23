const util = require('util')
const _ = require('lodash')

module.exports = (file, api, options) => {
  const j = api.jscodeshift
  const root = j(file.source)

  function replaceWith (target, newObject) {
    for (const key in target) {
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

    const injectAcc = node.value.params.length === 2 || accReferences > 0

    const newParams = [
      {
        type: 'Identifier',
        name: 'input'
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
          name: 'input'
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
          name: 'input'
        })
      })

    return node.value
  }

  function checkInputVariable (node) {
    j(node)
      .find(j.Identifier, {
        name: 'input'
      })
      .forEach(nodePath => {
        const parentNode = nodePath.parentPath.value
        if (parentNode.type !== 'MemberExpression') {
          const nodeStart = parentNode.loc.start
          throw Error(
            util.format(
              'Refactor Reducer arguments (acc) -> (input, acc) Failed.',
              '\nA variable with name `input` already exists in the scope of a reducer function.',
              `\n\n${j(node).toSource()}`,
              `\n^------- ${file.path}:${nodeStart.line}:${nodeStart.column}`,
              "\n\nTry refactoring this block of code to remove any variable of name 'input' before running the codemod.\n\n"
            )
          )
        }
      })
  }

  function refactorReducer (node) {
    checkInputVariable(node)
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

  function filterNonReducers (nodePath) {
    // we want to filter out any function that is called by dataPoint.transform(a,b).then(acc => {})
    const grandParent = _.get(nodePath, 'parentPath.parentPath.value', {})
    const isThenHandlerFromTransform =
      grandParent.type === 'CallExpression' &&
      _.get(grandParent, 'callee.object.callee.property.name') ===
        'transform' &&
      _.get(grandParent, 'callee.property.name') === 'then'

    return !isThenHandlerFromTransform
  }

  function refactorReducerMatches (nodeType) {
    root
      .find(nodeType, isReducer)
      .filter(filterNonReducers)
      .forEach(refactorReducer)
  }

  refactorReducerMatches(j.FunctionDeclaration)
  refactorReducerMatches(j.ArrowFunctionExpression)
  refactorReducerMatches(j.FunctionExpression)

  return root.toSource()
}
