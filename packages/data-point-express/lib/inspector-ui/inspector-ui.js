const fs = require("fs");
const path = require("path");
const Promise = require("bluebird");

const readFile = Promise.promisify(fs.readFile);

function getInspector() {
  return readFile(path.resolve(__dirname, "inspect.html"), "utf8");
}

module.exports = {
  getInspector
};
