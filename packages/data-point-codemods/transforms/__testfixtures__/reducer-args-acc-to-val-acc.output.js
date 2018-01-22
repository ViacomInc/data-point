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

  // only references acc.value
  function reducer(value) {
    return {
      a: value,
      b: value[0],
      c: value.message.array[0].a,
      d: `${value.a}`
    };
  }

  const exp1 = function reducer(value) {
    return value;
  }

  const exp2 = value => {
    return value;
  }

  const exp3 = a => b => value => {
    return value;
  }

  // references any other property under acc
  function reducerPromise(value, acc) {
    return acc.locals
  }

  // references any other property under acc
  function reducerNodeStyle(value, acc, next) {
    next(value)
  }
}
