import { expect } from "https://deno.land/x/expect@v0.2.1/mod.ts";
import * as mock from "https://deno.land/x/expect@v0.2.1/mock.ts";

const test = (name, fn) => {
  return Deno.test({ name, fn });
};
test.each = (table) => (name, run) => {
  table.forEach((paramOrParam) => {
    let params = Array.isArray(paramOrParam) ? paramOrParam : [paramOrParam];
    Deno.test({
      name: name,
      fn: () => run(...params),
    });
  });
};
test.skip = (name, fn) => {
  return Deno.test({ name, fn, ignore: true });
};

function describe(_, fn) {
  fn();
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

const testMatcher = /(?<!skip-deno)(\.test\.js)$/
for await (const {name,isFile} of Deno.readDir("./tests")) {
  if(isFile && testMatcher.test(name)) {
    console.log(name);
    await import('./'+name);
  }
}
