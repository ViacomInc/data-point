const fs = require("fs").promises;

function getParent(span) {
  return span.root ? "root" : span.parent;
}

function getName(span) {
  return span === "root" ? "root" : `${span.name}${span.context.pid}`;
}

function graphTD(spans) {
  const nodes = spans.map(span => {
    return `  ${getName(getParent(span))}-->${getName(span)}`;
  });

  return `graph TD;\n${nodes.join("\n")}`;
}

class Mermaid {
  constructor() {
    this.spans = [];
  }

  static create() {
    return new Mermaid();
  }

  start(dpSpan) {
    this.spans.push(dpSpan);
  }

  async report(destinationPath) {
    const report = graphTD(this.spans);

    if (destinationPath) {
      await fs.writeFile(destinationPath, report);
    }

    return report;
  }
}

module.exports = {
  getParent,
  getName,
  graphTD,
  Mermaid
};
