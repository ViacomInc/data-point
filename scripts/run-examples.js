#!/usr/bin/env node

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const examplesFolder = "packages/data-point/examples/";

fs.readdir(examplesFolder, (err, files) => {
  if (err) {
    console.log(err);
    process.exitCode(1);
    return;
  }

  const startTime = Date.now();
  let errorCount = 0;

  coloredLog("blue", `Executing all examples in ${examplesFolder}`, true);

  const runExamples = files.map(file => {
    return new Promise(resolve => {
      const filename = examplesFolder + file;
      exec(`node ${path.resolve(filename)}`, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }

        if (stderr) {
          errorCount++;
          coloredLog("red", `stderr from ${filename}`, true);
          coloredLog("red", stderr);
        }

        resolve();
      });
    });
  });

  Promise.all(runExamples).then(() => {
    coloredLog(
      "green",
      `${files.length} examples were run in ${(Date.now() - startTime) /
        1000}s.`
    );
    coloredLog("red", `${errorCount} examples produced an error.`);
  });
});

/**
 * Colorize console.log()
 * @param {enum} color - choose red, green or blue. undefined/null will be white
 * @param {string} string - string to print
 * @param {boolean} underline - should string be underlined
 */
function coloredLog(color, string, underline) {
  let chosenColor;
  switch (color) {
    case "red":
      chosenColor = "\x1b[31m";
      break;
    case "green":
      chosenColor = "\x1b[32m";
      break;
    case "blue":
      chosenColor = "\x1b[34m";
      break;
    default:
      chosenColor = "\x1b[0m";
      break;
  }
  console.log(`${chosenColor}${underline ? "\x1b[4m" : ""}%s\x1b[0m`, string);
}
