import {
  checkConstructor,
  isPrimitive,
  isConstructor,
  isCustomValidator,
  isFunctionHacked,
  stringify,
  isClass,
  whatTypeIs,
} from "../src/helpers.js";
import { constructors } from "../src/constructors.js";
import { isValid } from "garn-validator";
import {  numbers, strings, notConstructors } from "./data.js";

class MyClass {}
const noop = () => {};
class Car {}
function MyFnClass() {}
function myFnClass() {}
class Porsche extends Car {}

describe("checkConstructor", () => {
  test.each([
    [RegExp, /regexp/],
    [RegExp, new RegExp("foo")],

    [Object, { a: 1 }],
    [Object, new Object({ b: 2 })],

    [Boolean, true],
    [Boolean, false],

    [Promise, new Promise(noop).catch(noop)],
    [Promise, Promise.resolve().catch(noop)],
    [Promise, Promise.reject().catch(noop)],
    [Promise, Promise.all([]).catch(noop)],
    [Promise, (async () => {})().catch(noop)],

    [String, "xs"],
    [String, ""],
    [String, ""],
    [String, ``],
    [String, new String("hola")],

    [MyClass, new MyClass()],

    [Number, 1],
    [Number, NaN],
    [Number, Infinity],
    [Number, 0.34],
    [Number, 3.1e12],

    [Array, [1, 2]],
    [Array, new Array(1, 2)],
    [ArrayBuffer, new ArrayBuffer(8)],

    [Symbol, Symbol()],

    [Map, new Map()],
    [WeakMap, new WeakMap()],
    [Set, new Set()],
    [WeakSet, new WeakSet()],
    [BigInt, BigInt(2)],
    [BigInt, 2n],

    [Car, new Car()],
    [MyFnClass, new MyFnClass()],
    [myFnClass, new myFnClass()],
  ])("should return true for type %p -- value %p", (type, val) => {
    expect(checkConstructor(type, val)).toBe(true);
  });
  test.each([
    [Object, []],
    [Object, new Error()],
    [Object, new MyClass()],
    [Object, function () {}],
    [Boolean, "true"],
    [String, 1],
    [String, []],
    [String, {}],
    [String, true],
    [Number, "1"],
    [Car, new Porsche()],
    [Object, new Array()],
  ])("should return false for type %p -- value %p", (type, val) => {
    expect(checkConstructor(type, val)).toBe(false);
  });
});

describe("isPrimitive", () => {
  test.each([
    [null, true],
    // undefined : typeof instance === "undefined"
    [undefined, true],
    // Boolean : typeof instance === "boolean"
    [false, true],
    [true, true],
    // Symbol : typeof instance === "symbol"
    [Symbol(), true],
    // BigInt : typeof instance === "bigint"
    [1n, true],
    [BigInt("12"), true],
    [BigInt(12), true],

    // Object : typeof instance === "object"
    [{}, false],
    [/regex/, false],
    [() => {}, false],
    [[], false],
    [new Map(), false],
    [new Set(), false],
    [class {}, false],
    [function () {}, false],
    [function* () {}, false],
    [() => {}, false],
    [async () => {}, false],
  ])("should recognize %p as %p", (val, expected) => {
    expect(isPrimitive(val)).toBe(expected);
  });
  // test.each(constructors)("should recognize  %f", (val) => {
  //   expect(isPrimitive(val)).toBe(false);
  // });
  test.each(numbers)("should recognize number %f", (val) => {
    expect(isPrimitive(val)).toBe(true);
  });

  test.each(strings)("should recognize string %s", (val) => {
    expect(isPrimitive(val)).toBe(true);
  });
});

describe("isConstructor", () => {
  const fnArrow = () => {};
  const FnArrow = () => {};
  const FnAsync = async () => {};
  const Fn = function () {};
  const fn = function () {};
  test.each([
    [Object, true],
    [Array, true],
    [class myClass {}, true],
    [class MyClass {}, true],
    [Promise, true],
    [Date, true],
    // [Proxy, true],
    [Function, true],
    [null, false],
    [undefined, false],
    [console.log, false],
    [12, false],
    [() => {}, false],
    [fn, false],
    [FnAsync, false],
    [fnArrow, false],
    [FnArrow, false],
    [Fn, false],
    [function Name() {}, false],
    [function name() {}, false],
    [Math, false],
  ])("isConstructor(%s) === %p", (value, expected) => {
    expect(isConstructor(value)).toBe(expected);
  });
  // TODO PROXY detection failing in deno
  // test.each(constructors)("isConstructor(%s) is constructor", (input) => {
  //   expect(isConstructor(input)).toBe(true);
  // });
  test.each(notConstructors)(
    "isConstructor(%s) not is constructor",
    (input) => {
      expect(isConstructor(input)).toBe(false);
    }
  );
});

describe("isFunctionHacked ", () => {
  function hack() {}
  hack.toString = () => "class {}";

  test.each([
    [function () {}, false],
    [function* () {}, false],
    [async function () {}, false],
    [function Name() {}, false],
    [(classArg) => classArg, false],
    [Array.isArray, false],

    [class {}, false],
    [class MyClass {}, false],
    [hack, true],
  ])("input %p should return %p", (input, expected) => {
    expect(isFunctionHacked(input)).toBe(expected);
  });
});
describe("isClass", () => {
  function hack() {}
  hack.toString = () => "class {}";

  test.each([
    [class {}, true],
    [class MyClass {}, true],

    ["class {}", false],
    [hack, false],
    [(classArg) => classArg, false],
    [(class_) => class_, false],
    [(class$) => class$, false],
    [Object, false],
    [Error, false],
    [undefined, false],
  ])("input %p should return %p", (input, expected) => {
    let r = isClass(input);
    r !== expected && console.warn(input.toString(), expected);
    expect(r).toBe(expected);
  });
});

describe("isCustomValidator", () => {
  test.each([
    [() => {}, true],
    [function name() {}, true],
    [function () {}, true],
    [Object, false],
    [Number, false],
    [Object.is, true],
    ["asdasd", false],
    [1, false],
    [async () => {}, false], // noy yet supported
    [function* () {}, false], // noy yet supported
    [class {}, false], // noy yet supported
  ])("isCustomValidator(%p) should return %p", (input, expected) => {
    expect(isCustomValidator(input)).toBe(expected);
  });
});

describe("stringify", () => {
  test("should work as expected", () => {
    expect(stringify({ a: 1 })).toBe(`{"a":1}`);
  });
  test.each([
    [/.*/, "/.*/"],
    [1, "1"],
    [true, "true"],
    [null, "null"],
    [NaN, "NaN"],
    [Infinity, "Infinity"],
    [-Infinity, "-Infinity"],
    [{}, "{}"],
    [undefined, undefined], // doesn't stringify. Normal behavior of JSON.stringify
    ["string", '"string"'], // normal behavior,  in order to parse it back
  ])(" %p should be %p", (input, expected) => {
    expect(stringify(input)).toBe(expected);
  });
  test("should work with arrays", () => {
    expect(stringify([1])).toBe(`[1]`);
    expect(stringify([{ x: "x" }])).toBe(`[{"x":"x"}]`);
  });
  test("should work with circular structure", () => {
    const obj = { a: 1 };
    const circular = { b: 2, c: 3, o: obj };
    obj.circular = obj;
    circular.repeated = obj;
    circular.all = circular;
    expect(stringify(circular)).toMatch(
      `{"b":2,"c":3,"o":{"a":1,"circular":"[circular reference] -> o"},"repeated":"[circular reference] -> o","all":"[circular reference] -> rootObject"}`
    );
  });
  test.skip("should parse functions to strings", () => {
    // TODO fix for deno tests
    expect(stringify((x) => x * 2)).toBe(`x=>x*2`);
  });
  // TODO fix for deno tests

  test.skip("should parse functions to strings", () => {
    const obj = {
      x: 1,
      f: (x) => x * 2,
      constructor: Number,
      classical: function classical(arg) {
        return arg;
      },
      myClass: class MyClass {},
    };
    expect(stringify(obj)).toBe(
      `{"x":1,"f":x=>x*2,"constructor":Number,"classical":function classical(arg){return arg},"myClass":MyClass}`
    );
  });
});
describe("whatTypeIs", () => {
  // test.each(constructors)("whatTypeIs(%s) is constructor", (input) => {
  //   expect(whatTypeIs(input)).toBe("constructor");
  // });
  const VALIDATOR = () => {};
  test.each([
    [{}, "schema"],
    [[], "enum"],
    [1, "primitive"],
    [null, "primitive"],
    [undefined, "primitive"],
    ["undefined", "primitive"],
    [() => {}, "validator"],
    [VALIDATOR, 'validator'],
    [isValid(Number), 'main-validator'],
    [class Car{}, "constructor"],

    [async () => {}, "invalid"], // noy yet supported
    [function* () {}, "invalid"], // noy yet supported
  ])("whatTypeIs(%s) is %p", (input, output) => {
    expect(whatTypeIs(input)).toBe(output);
  });
});
