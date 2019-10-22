const fs = require("fs");
const path = require("path");
const util = require("util");

const readFile = util.promisify(fs.readFile);

function getInspector() {
  return readFile(path.resolve(__dirname, "inspect.html"), "utf8");
}

module.exports = {
  getInspector
};
