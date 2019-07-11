#!/usr/bin/env node --expose-gc

const path = require('path')
const program = require('commander')
const Benchmark = require('benchmark')
const Promise = require('bluebird')
const chalk = require('chalk')

const pkg = require('./package.json')
const lib = require('./lib')

program
  .version(pkg.version)
  .usage('<fileName>')
  .option(
    '-i, --iterations [count]',
    'Number of iterations, defaults to 10',
    parseInt
  )
  .option('-s, --skip-tests', 'skip tests')

program.parse(process.argv)

const filePath = program.args[0]

const testSuite = require(path.resolve(filePath))

const suites = Array.isArray(testSuite) ? testSuite : [testSuite]

const iterations = program.iterations || 10

function start (suites) {
  console.log(
    'Running %s suite(s) with %s iterations each\n',
    chalk.yellow(suites.length),
    chalk.yellow(iterations)
  )
  return runTests(suites)
    .then(runBenchmarks)
    .then(reportFinal)
    .catch(err => {
      console.error(chalk.red('\nFailed to run benchmark\n'))
      console.log(err.stack)
      process.exit(1)
    })
}

function runTest (suite) {
  const isAsync = !!suite.async

  if (typeof suite.test === 'function') {
    if (isAsync) {
      return Promise.fromCallback(suite.test)
    }

    return suite.test()
  }

  if (typeof suite.test.test === 'function') {
    const { test, expected } = suite.test

    if (isAsync) {
      return Promise.fromCallback(lib.test.async(test, expected))
    }

    return lib.test.sync(test, expected)()
  }

  throw new Error('Test was not provided or has invalid form')
}

function runTests (suites) {
  if (program.skipTests) {
    console.warn('%s Tests are skiped\n', chalk.yellow('WARNING:'))
    return Promise.resolve(suites)
  }

  console.log(chalk.white.bold('Test suite(s):'))
  return Promise.each(suites, suite => {
    return Promise.resolve(suite)
      .then(runTest)
      .then(() => {
        console.log(' %s %s', chalk.green(' ✔ '), suite.name)
      })
      .catch(err => {
        console.error(
          '%s %s Error: %s',
          chalk.red(' ✕ '),
          suite.name,
          chalk.red(err.toString())
        )
        throw err
      })
  }).return(suites)
}

function runBenchmarks (suites) {
  return Promise.reduce(
    suites,
    (acc, suite) => {
      return runGC(suite)
        .then(suite => {
          suite.memoryBefore = process.memoryUsage().heapUsed
          return runBenchmark(suite)
        })
        .then(suite => {
          suite.memoryAfter = process.memoryUsage().heapUsed
          suite.memoryEfficiency = suite.memoryAfter - suite.memoryBefore
          return suite
        })
        .then(suite => {
          acc.push(suite)
          return acc
        })
    },
    []
  )
}

function reportFinal (suites) {
  console.log(chalk.white.bold('\nReport:'))

  if (suites.length === 2) {
    reportFasterOpsperSec(suites)
  }

  if (suites.length > 2) {
    listBySpeed(suites)
  }

  const hzSet = suites.map(suite => suite.median)
  console.log(
    '\n Total number of operations per second: %s',
    chalk.yellow(fnumber(sum(hzSet)) + 'Hz')
  )

  return suites
}

function listBySpeed (suites) {
  console.log(chalk.white.bold('\n Fastest (median ops/sec):'))
  const sorted = suites.sort((a, b) => b.median - a.median)
  sorted.forEach((suite, index) => {
    const name = index === 0 ? chalk.yellow(suite.name) : chalk.bold(suite.name)

    console.log('  %s: %s', name, chalk.yellow(fnumber(suite.median) + 'Hz'))
  })
}

function reportFasterOpsperSec (suites) {
  const sorted = suites.sort((a, b) => b.median - a.median)
  const first = sorted[0]
  const second = sorted[1]

  const diffMedian = ((first.median - second.median) / second.median) * 100

  console.log(
    ` Speed: %s was faster by %s (%s vs %s)`,
    chalk.yellow(first.name),
    chalk.white.bold(diffMedian.toFixed(2) + '%'),
    chalk.yellow(fnumber(first.median) + 'Hz'),
    chalk.yellow(fnumber(second.median) + 'Hz')
  )
}

function runBenchmark (suiteBenchmark) {
  return new Promise((resolve, reject) => {
    const suite = new Benchmark.Suite()

    const asyncLabel = suiteBenchmark.async ? 'ASYNC' : 'SYNC'
    console.log(
      '\n%s %s [%s]\n',
      chalk.white.bold('Benchmarking:'),
      chalk.bold(suiteBenchmark.name),
      asyncLabel
    )

    const isAsync = !!suiteBenchmark.async
    const benchmarkMethod =
      isAsync === true
        ? lib.benchmark.async(suiteBenchmark.benchmark)
        : suiteBenchmark.benchmark

    for (let index = 0; index < iterations; index++) {
      suite.add(`${index + 1} ${suiteBenchmark.name}`, {
        defer: isAsync,
        fn: benchmarkMethod
      })
    }

    // add listeners
    suite
      .on('cycle', function (event) {
        console.log('', String(event.target))
      })
      .on('error', reject)
      .on('complete', function () {
        const benchmarks = Array.from(this)
        const hzSet = benchmarks
          .map(benchmark => benchmark.hz)
          .sort((a, b) => a - b)
        const hzSum = sum(hzSet)

        const average = hzSum / hzSet.length
        const median = middle(hzSet)

        console.log(
          '\n Ran %s (%s times) with an average of %s ops/sec',
          chalk.yellow(suiteBenchmark.name),
          chalk.yellow(iterations),
          chalk.yellow(fnumber(average))
        )
        console.log('  Fastest: %s ops/sec', fnumber(Math.max(...hzSet)))
        console.log('  Average: %s ops/sec', chalk.bold(fnumber(average)))
        console.log('  Median : %s ops/sec', chalk.white.bold(fnumber(median)))
        console.log('  Slowest: %s ops/sec', fnumber(Math.min(...hzSet)))

        resolve(
          Object.assign({}, suiteBenchmark, {
            average,
            median
          })
        )
      })
      // run async
      .run({ async: true })
  })
}

function fnumber (x) {
  return Math.floor(x)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function sum (values) {
  return values.reduce((acc, val) => acc + val)
}

function middle (values) {
  const len = values.length
  const half = Math.floor(len / 2)

  if (len % 2) {
    return (values[half - 1] + values[half]) / 2.0
  } else {
    return values[half]
  }
}

function bytesToKb (bytes) {
  return Math.round((bytes / 1024) * 100) / 100
}

function runGC (val) {
  return Promise.resolve(val).then(r => {
    global.gc()
    return r
  })
}

function listByMemoryEfficiency (suites) {
  console.log(chalk.white.bold('\nMore memory efficient:'))
  const sorted = suites.sort((a, b) => a.memoryEfficiency - b.memoryEfficiency)
  sorted.forEach((suite, index) => {
    const name = index === 0 ? chalk.yellow(suite.name) : chalk.bold(suite.name)

    console.log(
      ' %s: %s',
      name,
      chalk.yellow(fnumber(bytesToKb(suite.memoryEfficiency)) + 'Kb')
    )
  })
}

function reportSuiteMemory (suite) {
  const { memoryBefore, memoryAfter } = suite
  console.log(
    '  Memory: not freed %s (before %s after %s)',
    chalk.red.bold(fnumber(bytesToKb(memoryAfter - memoryBefore)) + 'Kb'),
    chalk.white.bold(fnumber(bytesToKb(memoryBefore)) + 'Kb'),
    chalk.white.bold(fnumber(bytesToKb(memoryAfter)) + 'Kb')
  )
  return suite
}

function reportMemoryEfficincy (suites) {
  const sortedSuites = suites.sort(
    (a, b) => a.memoryEfficiency - b.memoryEfficiency
  )
  const first = sortedSuites[0]
  const second = sortedSuites[1]

  const diffMemory =
    ((second.memoryEfficiency - first.memoryEfficiency) /
      second.memoryEfficiency) *
    100

  console.log(
    ` Memory: %s was more memory efficient by %s (%s vs %s)`,
    chalk.yellow(first.name),
    chalk.white.bold(diffMemory.toFixed(2) + '%'),
    chalk.yellow(fnumber(bytesToKb(first.memoryEfficiency)) + 'Kb'),
    chalk.yellow(fnumber(bytesToKb(second.memoryEfficiency)) + 'Kb')
  )
}

function unhandledError (err) {
  console.log('Failed Tests: ' + err.stack)
}

process.on('unhandledRejection', unhandledError)
process.on('uncaughtException', unhandledError)

start(suites)

module.exports = {
  start,
  runTests,
  runBenchmarks,
  reportFinal,
  listBySpeed,
  reportFasterOpsperSec,
  runBenchmark,
  fnumber,
  sum,
  middle,
  bytesToKb,
  runGC,
  listByMemoryEfficiency,
  reportSuiteMemory,
  reportMemoryEfficincy
}
