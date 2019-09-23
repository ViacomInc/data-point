module.exports = (file, api) => {
  const j = api.jscodeshift;
  const rootPathWithDotRegex = /\$\.(\s|$)/g;

  const root = j(file.source);

  function detectQuoteStyle(item, quoteRoot) {
    let detectedQuoting = "single";

    quoteRoot
      .find(item.Literal, {
        value: v => typeof v === "string",
        raw: v => typeof v === "string"
      })
      .forEach(p => {
        // The raw value is from the original babel source
        if (p.value.raw[0] === "'") {
          detectedQuoting = "single";
        }

        if (p.value.raw[0] === '"') {
          detectedQuoting = "double";
        }
      });

    return detectedQuoting;
  }

  // transforms a string from '$. | $. | $.' -> '$ | $ | $'
  function transformLiteral(node) {
    const originalValue = node.value.value;
    if (rootPathWithDotRegex.test(originalValue)) {
      // eslint-disable-next-line no-param-reassign
      node.value.value = node.value.value.replace(rootPathWithDotRegex, "$$$1");
    }
  }

  // transforms a template literal from `$. | $. | $.` -> `$ | $ | $`
  function transformTemplateElement(node) {
    const originalValue = node.value.value.raw;
    if (rootPathWithDotRegex.test(originalValue)) {
      // eslint-disable-next-line no-param-reassign
      node.value.value.raw = node.value.value.raw.replace(
        rootPathWithDotRegex,
        "$$$1"
      );
    }
  }

  function refactorReducerMatches(nodeType, transform) {
    root.find(nodeType).forEach(transform);
  }

  refactorReducerMatches(j.Literal, transformLiteral);
  refactorReducerMatches(j.TemplateElement, transformTemplateElement);

  // As Recast is not preserving original quoting, we try to detect it,
  // and default to something sane.
  // See https://github.com/benjamn/recast/issues/171
  // and https://github.com/facebook/jscodeshift/issues/143
  // credit to @skovhus: https://github.com/avajs/ava-codemods/pull/28
  const quote = detectQuoteStyle(j, root);
  return root.toSource({ quote });
};
