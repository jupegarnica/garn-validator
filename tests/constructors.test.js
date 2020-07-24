import check from "garn-validator";

describe("check with constructors", () => {
  test("should work", () => {
    expect(() => {
      check(String)("a string");
    }).not.toThrow();

    expect(() => {
      check(Number)(1);
    }).not.toThrow();

    expect(() => {
      check(Boolean)(true);
    }).not.toThrow();

    expect(() => {
      check(RegExp)(/\s/);
    }).not.toThrow();

    expect(() => {
      check(Array)([]);
    }).not.toThrow();

    expect(() => {
      check(Error)(new Error());
    }).not.toThrow();
    expect(() => {
      check(RangeError)(new RangeError());
    }).not.toThrow();
    expect(() => {
      check(Object)({});
    }).not.toThrow();
    expect(() => {
      check(Date)(new Date());
    }).not.toThrow();

    expect(() => {
      check(Map)(new Map());
    }).not.toThrow();
    expect(() => {
      check(Set)(new Set());
    }).not.toThrow();
    expect(() => {
      check(Symbol)(Symbol("my symbol"));
    }).not.toThrow();
    expect(() => {
      class MyClass {}
      check(MyClass)(new MyClass());
    }).not.toThrow();
  });
  test("should throw", () => {
    expect(() => {
      check(String)(1);
    }).toThrow();

    expect(() => {
      check(Number)("1");
    }).toThrow();

    expect(() => {
      check(Boolean)(null);
    }).toThrow();

    expect(() => {
      check(RegExp)("/s/");
    }).toThrow();

    expect(() => {
      check(Array)({});
    }).toThrow();

    expect(() => {
      check(Error)(new RangeError());
    }).toThrow();
    expect(() => {
      check(Object)([]);
    }).toThrow();
    expect(() => {
      check(Object)(null);
    }).toThrow();

    expect(() => {
      check(Map)(new WeakMap());
    }).toThrow();
    expect(() => {
      check(Set)(new WeakSet());
    }).toThrow();
  });
});
