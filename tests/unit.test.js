import {
  isType,
  isPrimitive,
  isConstructor,
  isCustomValidator,
  isFunction,
  stringify,
  isInstanceOf,
  isClass,
  isError,
} from "../src/utils";

import { isValidType as _isValidType } from "garn-validator";

class MyClass {}
const noop = () => {};
class Car {}
function MyFnClass() {}
function myFnClass() {}
class Porsche extends Car {}

describe("isType by constructor", () => {
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
    expect(isType(type)(val)).toBe(true);
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
    expect(isType(type)(val)).toBe(false);
  });
});

describe("isPrimitive", () => {
  test.each([
    ["a", true],
    [1, true],
    [false, true],
    [NaN, true],
    [undefined, true],
    [null, true],
    [Symbol(), true],

    [{}, false],
    [/regex/, false],
    [() => {}, false],
    [[], false],
    [new Map(), false],
    [new Set(), false],
    [class {}, false],
    [function () {}, false],
  ])("should recognize %p as %p", (val, expected) => {
    expect(isPrimitive(val)).toBe(expected);
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
    [console.log, false],
    [12, false],
    [() => {}, false],
    [fn, false],
    [Fn, true],

    [FnAsync, false],

    [fnArrow, false],
    [FnArrow, false],

    [function Name() {}, true],
    [function name() {}, false],
    [class myClass {}, true],
    [class MyClass {}, true],
    [Promise, true],
  ])("should detect if %p is constructor or not", (value, expected) => {
    expect(isConstructor(value)).toBe(expected);
  });
});

describe("isFunction not hacked", () => {
  function hack() {}
  hack.toString = () => "class {}";

  test.each([
    [function () {}, true],
    [function* () {}, true],
    [async function () {}, true],
    [function Name() {}, true],
    [(classArg) => classArg, true],
    [Array.isArray, true],

    [class {}, false],
    [class MyClass {}, false],
    [hack, false],
  ])("input %p should return %p", (input, expected) => {
    expect(isFunction(input)).toBe(expected);
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
    [Object, false],
    [Error, false],
    [undefined, false],
  ])("input %p should return %p", (input, expected) => {
    expect(isClass(input)).toBe(expected);
  });
});

describe("isCustomValidator:detect if a function is anonymous or its name starts with lowercase", () => {
  test.each([
    [() => {}, true],
    [function name() {}, true],
    [function () {}, true],
    // [async () => {}, false], // noy yet supported
    [Object, false],
    [Object.is, true],
    ["asdasd", false],
    [1, false],
  ])("isCustomValidator(%p) should return %p", (input, expected) => {
    expect(isCustomValidator(input)).toBe(expected);
  });
});

describe("isValidType", () => {

  const isValidType = (...args) => _isValidType(undefined, ...args);

  test.each([
    [/.ola/, "hola", true],
    [new RegExp("hola"), "hola", true],
    [/.ola/, "sola", true],
    [/.ola/, "ola", false],
  ])("should work for regex: %p %p to be %p", (type, value, expected) => {
    expect(isValidType(type, value)).toBe(expected);
  });

  test.each([
    [String, "a", true],
    [String, 1, false],
    [RegExp, /12/, true],
  ])(
    "should work for constructors:  %p %p to be %p",
    (type, value, expected) => {
      expect(isValidType(type, value)).toBe(expected);
    }
  );
  test.each([
    ["a", "a", true],
    ["a", `a${""}`, true],
    ["a", "b", false],
    [1.0, 1, true],
    [2, 1, false],
    [true, true, true],
    [undefined, undefined, true],
    [null, null, true],
  ])("should work for primitives:  %p %p to be %p", (type, value, expected) => {
    expect(isValidType(type, value)).toBe(expected);
  });

  test("should work for enums of constructors", () => {
    expect(isValidType([String, Function], "a")).toBe(true);
    expect(isValidType([String, Function], 1)).toBe(false);
    expect(isValidType([String, Object], [])).toBe(false);
  });
  test("should work for enums of primitives", () => {
    expect(isValidType(["b", "a"], "a")).toBe(true);
    expect(isValidType(["b", "a"], "c")).toBe(false);
    expect(isValidType([undefined, String], "c")).toBe(true);
    expect(isValidType([undefined, String], undefined)).toBe(true);
    expect(isValidType([undefined, Number], "c")).toBe(false);
  });

  test.each([
    [{ a: Number }, { a: 1 }],
    [{ a: [Number, String] }, { a: "a" }],
    [{ a: [Number, String], b: [undefined, "b"] }, { a: "a" }],
    [
      { a: [Number, String], b: [undefined, "b"] },
      { a: "a", b: "b" },
    ],
    //  [{ a: Number }, { a: "a" },false],
  ])("should work for shapes: %p : %p", (schema, value) => {
    expect(isValidType(schema, value)).toBe(true);
  });
  test.each([
    [{ a: Number }, { a: "1" }],
    [{ a: [Number, String] }, {}],
    [{ a: Number }, { a: "a" }],
  ])("should throw for shapes: %p : %p", (schema, value) => {
    expect(() => {
      isValidType(schema, value);
    }).toThrow();
  });

  test("should work for custom validators functions", () => {
    expect(isValidType((value) => value > 5, 6)).toBe(true);
    expect(isValidType((value) => value === 5, 6)).toBe(false);

    expect(
      isValidType(
        (value, propName, props) => propName === value,
        6,
        { a: "a" },
        "a"
      )
    ).toBe(false);
  });
  test("should use a camelCase function or anonymous", () => {
    function validator(v) {
      return true;
    }
    function Validator(v) {
      return true;
    }
    expect(isValidType(validator, 3)).toBe(true);
    expect(isValidType(Validator, 3)).toBe(false);
  });

  test("should throw", () => {
    expect(() => {
      isValidType(() => {
        throw "asd";
      }, 6);
    }).toThrow();
  });
  test("should throw custom message", () => {
    expect(() => {
      isValidType((value) => {
        if (value > 5) {
          throw "must be greater than 5";
        }
      }, 6);
    }).toThrow("must be greater than 5");
  });

  test("should throw custom Error", () => {
    expect(() => {
      isValidType((value) => {
        if (value > 5) {
          throw new RangeError("must be greater than 5");
        }
      }, 6);
    }).toThrow("must be greater than 5");
  });
  test("should throw custom Error", () => {
    expect(() => {
      isValidType((value) => {
        if (value > 5) {
          throw new RangeError("must be greater than 5");
        }
      }, 6);
    }).toThrow(RangeError);
  });
});
describe("stringify", () => {
  test("should work as expected", () => {
    expect(stringify({ a: 1 })).toBe(`{"a":1}`);
  });
  test.each([
    [/.*/, '"/.*/"'],
    [1, "1"],
    [true, "true"],
    [null, "null"],
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
  test("should parse functions to strings", () => {
    expect(stringify((x) => x * 2)).toBe(`"x=>x*2"`);
  });

  test("should parse functions to strings", () => {
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
      `{"x":1,"f":"x=>x*2","constructor":"Number","classical":"function classical(arg){return arg}","myClass":"MyClass"}`
    );
  });
});

describe("isInstanceOf", () => {
  test("should work", () => {
    expect(isInstanceOf(Object)({})).toBe(true);
    expect(isInstanceOf(Object)([])).toBe(true);
    expect(isInstanceOf(Object)(new Map())).toBe(true);

    expect(isInstanceOf(Object)(2)).toBe(false);
  });
});
