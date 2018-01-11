#!/usr/bin/env node

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const examplesFolder = 'packages/data-point/examples/'

fs.readdir(examplesFolder, (err, files) => {
  if (err) {
    console.log(err)
    return
  }

  coloredLog('blue', `Executing all examples in ${examplesFolder}`, true)

  files.forEach(file => {
    const filename = examplesFolder + file
    exec(`node ${path.resolve(filename)}`, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        return
      }

      if (stdout) {
        coloredLog('green', `stdout from ${filename}`, true)
        coloredLog('green', stdout)
      }

      if (stderr) {
        coloredLog('red', `stderr from ${filename}`, true)
        coloredLog('red', stderr)
      }
    })
  })
})

/**
 * Colorize console.log()
 * @param {enum} color - choose red, green or blue. undefined/null will be white
 * @param {string} string - string to print
 * @param {boolean} underline - should string be underlined
 */
function coloredLog (color, string, underline) {
  let chosenColor
  switch (color) {
    case 'red':
      chosenColor = '\x1b[31m'
      break
    case 'green':
      chosenColor = '\x1b[32m'
      break
    case 'blue':
      chosenColor = '\x1b[34m'
      break
    default:
      chosenColor = '\x1b[0m'
      break
  }
  console.log(`${chosenColor}${underline ? '\x1b[4m' : ''}%s\x1b[0m`, string)
}
