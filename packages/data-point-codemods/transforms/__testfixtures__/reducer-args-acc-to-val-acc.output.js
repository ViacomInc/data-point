/* eslint-disable */
/* eslint-disable prettier */

// prettier-ignore
{
  // first parameter is not named acc
  function nonReducer1(foo) {
    return foo.value
  }

  // last method is not a function
  function nonReducer2(acc, next) {
    return acc.locals
  }

  // reducers only have 2 params
  function nonReducer3(acc, next, foo) {
    return acc.locals
  }

  // not a reducer either
  d.transform(1,2).then(acc => {
    return {
      a: acc.value,
      b: acc.value[0],
      c: acc.value.message.array[0].a,
      d: `${acc.value.a}`
    };
  })

  d.transform(1,2).then(acc => {
    acc.value
  })

  // only references acc.value
  function reducer(input) {
    return {
      a: input,
      b: input[0],
      c: input.message.array[0].a,
      d: `${input.a}`
    };
  }

  const exp1 = function reducer(input) {
    return input;
  }

  const exp2 = input => {
    return input;
  }

  const exp3 = a => b => input => {
    return input;
  }

  // references any other property under acc
  function reducerPromise(input, acc) {
    return acc.locals
  }

  // references any other property under acc
  function reducerNodeStyle(input, acc, next) {
    next(input)
  }
}
