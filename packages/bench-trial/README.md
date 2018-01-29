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

- **Ambiguous results**: tests would throw different results every time I ran the test, specially if the difference was minimal. If I ran the same test multiple times the numbers changed, as time went by I would get more and more operations per second on each benchmark. This would only happen if I ran the tests consecutively, the reason of this might be related to the v8 engine warming up and optimizing the code the more I ran it. If I let some time to cool off, the tests would go back down on operations per second.
- **Reliable Execution**: more than once I made changes on the code being tested and never did I notice the change I had made was not even executing correctly. So the results I was getting were really unreliable.

## Solution

- **Ambiguous results**: Run benchmark more than once to get median and average results, because the test will run multiple times the code will get optimized, using the median we can get more reliable results. 
- **Reliable Execution**: Run a simple assertion tests on each suite before the actual benchmark runs, this helps us make sure our test are executing correctly. 

## API

```bash
bench-trial <file> [-i <iterations>] [-s]
```

- `-i --iterations <iteration>` iterations default to 10 iterations if not provided.
- `-s --skip-tests` if provided, it will skip the assertion tests.

### Writing your benchmark suites

The file you provide to bench-trial should export an `array` of suites, each suite is an object in the form of: 

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

to write your manual test see the manual test example below

## Examples

Test synchronous code [example](examples/array-iteration.js)
Test asynchronous code [example](examples/async-example.js)
Write manual test sync/asynchronous code [example](examples/manual-tests.js)


## Acknowledgements

This tool is only a wrapper of [benchmarkjs](https://benchmarkjs.com), so the credit really goes to them.

## <a name="contributing">Contributing</a>

Please read [CONTRIBUTING.md](https://github.com/ViacomInc/data-point/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## <a name="license">License</a>

This project is licensed under the  Apache License Version 2.0 - see the [LICENSE](LICENSE) file for details
