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
  function reducer(acc) {
    return {
      a: acc.value,
      b: acc.value[0],
      c: acc.value.message.array[0].a,
      d: `${acc.value.a}`
    }
  }

  const exp1 = function reducer(acc) {
    return acc.value
  }

  const exp2 = acc => {
    return acc.value
  }

  const exp3 = a => b => acc => {
    return acc.value
  }

  // references any other property under acc
  function reducerPromise(acc) {
    return acc.locals
  }

  // references any other property under acc
  function reducerNodeStyle(acc, next) {
    next(acc.value)
  }

  // valid reducer
  const f = input = acc => {
    // should change value, and not throw error finding input as an identifier
    return acc.value.input
  }
}
