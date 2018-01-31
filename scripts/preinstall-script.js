#!/usr/bin/env node

const setup =
  '\nhttps://github.com/ViacomInc/data-point/blob/master/CONTRIBUTING.md#setup\n'

if (process.env.npm_execpath.indexOf('yarn') === -1) {
  console.error(
    '\x1b[41m',
    'Error: You must use yarn to install dependencies.\n\n',
    'For help setting up this project please vist:',
    '\x1b[0m',
    '\x1b[36m',
    '\n',
    setup
  )
  process.exit(1)
}
