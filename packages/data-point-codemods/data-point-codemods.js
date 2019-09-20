#!/usr/bin/env node
"use strict";

const upgrader = require("lib-upgrader");
const pkg = require("./package.json");
const releases = require("./releases.json");

const settings = {
  libraryName: "data-point",
  releases: releases,
  pkg: pkg,
  dirname: __dirname
};

upgrader(settings)
  .then(upgrader.checkForUpdates)
  .then(upgrader.checkGitIsClean)
  .then(upgrader.prompt)
  .then(upgrader.applyCodemods)
  .then(upgrader.printTip)
  .catch(function(err) {
    console.error(err.message);
    process.exit(1);
  });
