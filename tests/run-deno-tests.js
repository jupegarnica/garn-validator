import { expect } from "https://deno.land/x/expect@9effa6/mod.ts";
import * as mock from "https://deno.land/x/expect@9effa6/mock.ts";
import { exec, OutputMode } from "https://deno.land/x/exec/mod.ts";
const test = (msg, fn) => {
  return Deno.test(msg, fn);
};
test.each = (table) => (msg, run) => {
  table.forEach((paramOrParam) => {
    let params = Array.isArray(paramOrParam) ? paramOrParam : [paramOrParam];
    test({
      name: msg,
      fn: () => run(...params),
    });
  });
};
test.skip = (msg, fn) => {};

function describe(msg, fn) {
  return fn();
}
globalThis.expect = expect;
globalThis.test = test;
globalThis.describe = describe;
globalThis.jest = {
  spyOn(target, method) {
    let spy = mock.fn();
    target[method] = spy;
    return spy;
  },
};

try {
  let response = await exec(
    "deno test --importmap=import_map.json -A --unstable tests/",
    { output: OutputMode.Capture, continueOnError: true }
  );

  console.log(response);
} catch (error) {
  console.log(error);
}

// const p = Deno.run({
//   cmd: [
//     "deno",
//     "test",
//     "--importmap=import_map.json",
//     "--unstable",
//     "tests/"
//   ],
//   // stdout: "piped",
//   // stderr: "piped",
// });

// const all = await p.status();

// console.log(all);
