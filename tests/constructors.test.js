import mustBe, {
  AsyncFunction,
  GeneratorFunction,
} from "garn-validator";

import 'garn-validator/src/proxyDetection.js';

describe("check with constructors", () => {
  class MyClass {}

  test.each([
    [String, "a string"],
    [Number, 1],
    [Boolean, true],
    [RegExp, /\s/],

    [Error, new Error()],
    [RangeError, new RangeError()],

    [Array, []],

    [Object, {}],

    [Proxy, new Proxy({}, {})],
    [Proxy, new Proxy([], {})],

    [Object, new Proxy({}, {})],
    [Array, new Proxy([], {})],
    [URL, new URL("https://developer.mozilla.org")],
    [AsyncFunction, async () => {}],
    [GeneratorFunction, function* () {}],

    [Date, new Date()],
    [Map, new Map()],
    [Set, new Set()],
    [Symbol, Symbol("my symbol")],
    [MyClass, new MyClass()],
  ])("should work mustBe(%p)(%p)", (constructor, value) => {
    expect(() => {
      mustBe(constructor)(value);
    }).not.toThrow();
  });
  test.each([
    [String, 1],
    [Number, "1"],
    [Boolean, null],
    [RegExp, "/s/"],
    [Function, async () => {}],
    [Function, function* () {}],
    [Function, new MyClass()],
    [Error, new RangeError()],
    [RangeError, new Error()],
    [Object, []],
    [Object, null],
    [Array, {}],
    [Object, new Proxy([], {})],
    [Proxy, {}],
    [Array, new Proxy({}, {})],
    [Map, new WeakMap()],
    [Set, new WeakSet()],
    [URL, "https://developer.mozilla.org"],
    [String, new URL("https://developer.mozilla.org")],
  ])("should throw mustBe(%p)(%p)", (constructor, value) => {
    expect(() => {
      mustBe(constructor)(value);
    }).toThrow();
  });
});
