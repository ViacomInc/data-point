/**
 * Do NOT allow using `npm` as package manager for npm install.
 */

if (process.env.npm_execpath.indexOf('yarn') === -1) {
  console.error(
    '\x1b[41m',
    'Error: You must use Yarn to install dependencies\n',
    '\x1b[0m'
  )
  process.exit(1)
}

console.warn(
  '\x1b[36m%s\x1b[0m',
  '\nFor this project we recommend using yarn install package-name instead of npm install\n'
)
