import mustBe, {
  AsyncFunction,
  GeneratorFunction,
} from "garn-validator";

import "garn-validator/src/proxyDetection.js";

describe("Proxy detection", () => {
  test("Proxy should work as normal", () => {
    const target = { a: 1 };
    const proxy = new Proxy(target, {
      get: () => 33,
    });

    expect(proxy.a).toBe(33);
  });
  test("__isProxy", () => {
    const target = { a: 1 };
    const proxy = new Proxy(target, {
      get: () => 33,
    });
    expect(__isProxy(proxy)).toBe(true);
    expect(__isProxy(target)).toBe(false);
    expect(__isProxy([])).toBe(false);
    expect(__isProxy({})).toBe(false);
  });

  test.each([
    [Proxy, new Proxy({}, {})],
    [Proxy, new Proxy([], {})],

    [Object, new Proxy({}, {})],
    [Array, new Proxy([], {})],
  ])("should work mustBe(%p)(%p)", (constructor, value) => {
    expect(() => {
      mustBe(constructor)(value);
    }).not.toThrow();
  });
  test.each([
    [Object, new Proxy([], {})],
    [Array, new Proxy({}, {})],
    [Proxy, {}],
    [Proxy, []],
    [Proxy, null],
  ])("should throw mustBe(%p)(%p)", (constructor, value) => {
    expect(() => {
      mustBe(constructor)(value);
    }).toThrow();
  });
});
