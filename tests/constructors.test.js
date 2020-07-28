import check from "garn-validator";

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

    [Object, new Proxy({},{})],
    [Array, new Proxy([],{})],


    [Date, new Date()],
    [Map, new Map()],
    [Set, new Set()],
    [Symbol, Symbol("my symbol")],
    [MyClass, new MyClass()],
  ])("should work check(%p)(%p)", (constructor, value) => {
    expect(() => {
      check(constructor)(value);
    }).not.toThrow();
  });
  test.each([
    [String, 1],
    [Number, "1"],
    [Boolean, null],
    [RegExp, "/s/"],

    [Error, new RangeError()],
    [RangeError, new Error()],
    [Object, []],
    [Object, new Proxy([],{})],
    [Object, null],
    [Array, {}],
    [Array, new Proxy({},{})],
    [Map, new WeakMap()],
    [Set, new WeakSet()],
  ])("should throw check(%p)(%p)", (constructor, value) => {
    expect(() => {
      check(constructor)(value);
    }).toThrow();
  });
});
