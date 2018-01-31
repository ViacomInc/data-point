# Bench trial

> Runs one or multiple benchmark tests

## Install

```bash
npm install -g bench-trial
```

## Usage

```bash
bench-trial benchmarks/map-helper-vs-entity.js -i 5
```

## TL;DR

Runs one (or more) BenchmarkJs test multiple times enough to get less ambiguous results, includes basic testing to make sure tests are reliable. 

## Why?

While running [benchmarkjs](https://benchmarkjs.com) to compare different versions of code I found out a couple of things:

- **Consistency**: I noticed that the same benchmark tests were returning different results every time they executed. If they were re-run consecutively, I would get more operations per second on each benchmark. I believe the reason may be related to the v8 engine warming up and optimizing the code the more it ran, since if I let some time to "cool off" the operations per second for each test would decrease. These ambiguous results meant having to repeat tests to ensure some consistency.
- **Reliable Execution**: Occasionally I made changes to the benchmarked code and would overlook that it was not executing correctly, further compounding the issue of making the results unreliable.

## Solution

- **Consistency**: By running benchmark tests more than once, we can get median and average results and get a bigger picture with less fluctuation. Because the tests will run multiple times in succession, the code will get optimized by the engine, and we can use the median time as a more consistent and stable metric.
 
- **Tests for reliable execution**: By running simple assertion tests on each suite before the actual benchmark runs, we can be sure our tests are executing correctly. 

## API

```bash
bench-trial <file> [-i <iterations>] [-s]
```

- `-i --iterations <iteration>` iterations default to 10 iterations if not provided.
- `-s --skip-tests` if provided, it will skip the assertion tests.

### Writing your benchmark suites

The file provided to **bench-trial** should export an `array` of test suites, each test suite is an object in the form of:

```
{
  name: string,
  test: function,
  benchmark: function
}
```

| Property | Type | Description |
|:---|:---|:---|
| *name* | `String` | Name that describes the test you are running |
| *test* | `function` | function to run assertion test against the result of the code you want to benchmark |
| *benchmark* | `function` | function to pass to benchmarkjs Suite that actually runs the benchmark |

#### Sync vs Async

- Synchronous methods are simple methods that expect a return value.  
- Asynchronous methods are a bit different to benchmarkjs async methods, bench-trial expects async methods to follow the [error-first callbacks](https://nodejs.org/api/errors.html#errors_error_first_callbacks).

#### Testing

bench-trial provides a convenience method that accepts the function to execute and a value to check against the result of the code you are testing. It takes care of async vs async depending on how you set the `async` flag. 

```js
test(test:function, value:*)
```

To write your manual test see the manual test example below

## Examples

Test synchronous code [example](examples/array-iteration.js)
Test asynchronous code [example](examples/async-example.js)
Write manual test sync/asynchronous code [example](examples/manual-tests.js)

## Acknowledgements

This tool is a wrapper of [benchmarkjs](https://benchmarkjs.com), so all credit related to benchmarking itself really goes to them.

Thanks to [Paul Molluzzo](https://github.com/paulmolluzzo) for coming up with the name **bench-trial**! 

## <a name="contributing">Contributing</a>

Please read [CONTRIBUTING.md](https://github.com/ViacomInc/data-point/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## <a name="license">License</a>

This project is licensed under the  Apache License Version 2.0 - see the [LICENSE](LICENSE) file for details
