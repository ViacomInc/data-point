#!/usr/bin/env node

const upgrader = require("lib-upgrader");
const pkg = require("./package.json");
const releases = require("./releases.json");

const settings = {
  libraryName: "data-point",
  releases,
  pkg,
  dirname: __dirname
};

upgrader(settings)
  .then(upgrader.checkForUpdates)
  .then(upgrader.checkGitIsClean)
  .then(upgrader.prompt)
  .then(upgrader.applyCodemods)
  .then(upgrader.printTip)
  .catch(err => {
    // eslint-disable-next-line no-console
    console.error(err.message);
    process.exit(1);
  });
