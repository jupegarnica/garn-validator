import { expect } from "https://deno.land/x/expect@v0.2.1/mod.ts";
import * as mock from "https://deno.land/x/expect@v0.2.1/mock.ts";

const test = (name, fn) => {
  return Deno.test({ name, fn });
};
test.each = (table) => (name, run) => {
  table.forEach((paramOrParam) => {
    let params = Array.isArray(paramOrParam) ? paramOrParam : [paramOrParam];
    test({
      name: name,
      fn: () => run(...params),
    });
  });
};
test.skip = (name, fn) => {
  return Deno.test({ name, fn, ignore: true });
};

function describe(name, fn) {
  return fn();
}
describe.skip = (name, fn) => {
  return Deno.test({ name, fn, ignore: true });
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
await import("./composable.test.js");
