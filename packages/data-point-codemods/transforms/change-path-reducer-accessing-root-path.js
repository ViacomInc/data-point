module.exports = (file, api) => {
  const j = api.jscodeshift
  const rootPathWithDotRegex = /\$\.(\s|$)/g

  const root = j(file.source)

  // transforms a string from '$. | $. | $.' -> '$ | $ | $'
  function transformLiteral (node) {
    const originalValue = node.value.value
    if (rootPathWithDotRegex.test(originalValue)) {
      node.value.value = node.value.value.replace(rootPathWithDotRegex, '$$$1')
    }
  }

  // transforms a template literal from `$. | $. | $.` -> `$ | $ | $`
  function transformTemplateElement (node) {
    const originalValue = node.value.value.raw
    if (rootPathWithDotRegex.test(originalValue)) {
      node.value.value.raw = node.value.value.raw.replace(
        rootPathWithDotRegex,
        '$$$1'
      )
    }
  }

  function refactorReducerMatches (nodeType, transform) {
    root.find(nodeType).forEach(transform)
  }

  refactorReducerMatches(j.Literal, transformLiteral)
  refactorReducerMatches(j.TemplateElement, transformTemplateElement)

  return root.toSource()
}
