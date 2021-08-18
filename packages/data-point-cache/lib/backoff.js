/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function nextFibonacci(current) {
  const next = (current * (1 + Math.sqrt(5))) / 2.0;
  return Math.round(next);
}

async function backoff(fn, retry = 1) {
  let retryDelay = retry;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      retryDelay = nextFibonacci(retryDelay);
      console.error("data-point-cache - backoff error:", err);
      console.log(`data-point-cache - retrying in ${retryDelay}s`);
      await sleep(retryDelay * 1000);
    }
  }
}

module.exports = backoff;
