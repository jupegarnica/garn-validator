import {
  isType,
  isPrimitive,
  isConstructor,
  isNormalFunction,
  stringify,
  isInstanceOf,
} from "../src/utils";
import { isValidType } from "garn-validator";



describe("isType by constructor", () => {
  class MyClass {}
  test.each([
    [RegExp, /regexp/],
    [RegExp, new RegExp("foo")],

    [Object, { a: 1 }],
    [Object, new Object({ b: 2 })],

    [Boolean, true],
    [Boolean, false],

    [Promise, new Promise(()=>{}).catch(()=>{})],
    [Promise, Promise.resolve().catch(()=>{})],
    [Promise, Promise.reject().catch(()=>{})],
    [Promise, Promise.all([]).catch(()=>{})],
    [Promise, (async () => {})().catch(()=>{})],

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
    // not yet supported in jsdom
    [BigInt, BigInt(2)],
    [BigInt, 2n],
  ])("should return true for type %p -- value %p", (type, val) => {
    expect(isType(type)(val)).toBe(true);
  });
  test.each([
    [Object, []],
    [Object, new Error()],
    [Object, new MyClass()],
    [Object, function(){}],
    [Boolean, "true"],
    [String, 1],
    [String, []],
    [String, {}],
    [String, true],
    [Number, "1"],
  ])("should return false for type %p -- value %p", (type, val) => {
    expect(isType(type)(val)).toBe(false);
  });

  // test("should return false for built-in types", () => {
  //   expect(isType(Object)("{ a: 1 }")).toBe(false);

  //   expect(isType(Boolean)("true")).toBe(false);

  //   expect(isType(String)(1)).toBe(false);
  //   expect(isType(String)([])).toBe(false);
  //   expect(isType(String)({})).toBe(false);
  //   expect(isType(String)()).toBe(false);

  //   expect(isType(Number)("1")).toBe(false);
  // });

  test("should recognize instance of classes", () => {
    class Car {}
    expect(isType(Car)(new Car())).toBe(true);

    class Porsche extends Car {}

    expect(isType(Car)(new Porsche())).toBe(false);

    expect(isType(Object)(new Array())).toBe(false);
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
  test("should detect if a value can be instantiated with new", () => {
    expect(isConstructor(Object)).toBe(true);
    expect(isConstructor(Array)).toBe(true);
    expect(isConstructor(console)).toBe(false);
    expect(isConstructor(12)).toBe(false);
    expect(isConstructor(() => {})).toBe(false);
    expect(isConstructor(function name() {})).toBe(false);
    const fn = () => {};
    expect(isConstructor(fn)).toBe(false);
  });
});

describe("is normal function", () => {
  test("should detect if a function is anonymous or his name starts with lowercase (not a class)", () => {
    expect(isNormalFunction(Object)).toBe(false);
    expect(isNormalFunction(() => {})).toBe(true);
    expect(isNormalFunction(function name() {})).toBe(true);
    expect(isNormalFunction(function () {})).toBe(true);
    expect(isNormalFunction("asdasd")).toBe(false);
    expect(isNormalFunction(1)).toBe(false);
  });
});

describe("is Valid type", () => {
  test("should check RegExp", () => {
    expect(isValidType(/.ola/, "hola")).toBe(true);
    expect(isValidType(/.ola/, "sola")).toBe(true);
    expect(isValidType(/.ola/, "ola")).toBe(false);
  });

  test("should work for constructors", () => {
    expect(isValidType(String, "a")).toBe(true);
    expect(isValidType(String, 1)).toBe(false);
    expect(isValidType(RegExp, /12/)).toBe(true);
  });
  test("should work for primitives", () => {
    expect(isValidType("a", "a")).toBe(true);
    expect(isValidType("a", `a${""}`)).toBe(true);

    expect(isValidType("a", "b")).toBe(false);

    expect(isValidType(1.0, 1)).toBe(true);
    expect(isValidType(2, 1)).toBe(false);

    expect(isValidType(true, true)).toBe(true);
    expect(isValidType(undefined, undefined)).toBe(true);
    expect(isValidType(null, null)).toBe(true);
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
  test("should work for shapes", () => {
    expect(isValidType({ a: Number }, { a: 1 })).toBe(true);
    expect(isValidType({ a: Number }, { a: "a" })).toBe(false);

    expect(isValidType({ a: [Number, String] }, { a: "a" })).toBe(true);
    expect(
      isValidType(
        {
          a: [Number, String],
          b: [undefined, "b"],
        },
        { a: "a" }
      )
    ).toBe(true);
    expect(
      isValidType(
        {
          a: [Number, String],
          b: [undefined, "b"],
        },
        { a: "a", b: "b" }
      )
    ).toBe(true);
    expect(
      isValidType(
        {
          a: [Number, String],
          b: [undefined, "b"],
        },
        { a: "a", b: "c" }
      )
    ).toBe(false);
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
  test("should work with primitives", () => {
    expect(stringify(1)).toBe("1");
    expect(stringify(true)).toBe("true");
    expect(stringify(null)).toBe("null");
    expect(stringify(undefined)).toBe(undefined); // doesn't stringify. Normal behavior of JSON.stringify
    expect(stringify("string")).toBe('"string"'); // normal behavior,  in order to parse it back
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
