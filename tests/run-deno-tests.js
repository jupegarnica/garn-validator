import { expect } from "https://deno.land/x/expect@9effa6/mod.ts";
import * as mock from "https://deno.land/x/expect@9effa6/mock.ts";

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
test.skip = (msg) => {
  console.log("skipped: " + msg);
};

function describe(msg, fn) {
  return fn();
}
describe.skip = (msg) => {
  console.log("skipped: " + msg);
};

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

await import("./use.test.js");
await import("./unit.test.js");
await import("./strings.test.js");
await import("./speed.test.js");
await import("./schema.test.js");
await import("./numbers.test.js");
await import("./esm.test.js");
await import("./errors.test.js");
await import("./enums.test.js");
await import("./custom-validator.test.js");
await import("./constructors.test.js");
