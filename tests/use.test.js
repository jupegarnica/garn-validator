import isValidOrThrow, { isValid, arrayOf, objectOf,AsyncFunction,GeneratorFunction } from "garn-validator";


describe("isValid", () => {
  test.each([
    [Function, function () {}],
    [Function, () => {}],
    [GeneratorFunction, function* () {}],
    [AsyncFunction, async () => {}],
    [Promise, (async () => {})()],
    [Promise, new Promise(() => {})],
    [Promise, Promise.resolve()],
    [Object, {}],
    [Number, 2],
    [String, "str"],
  ])("isValid(%p)(%p) return true", (a, b) => {
    expect(isValid(a)(b)).toBe(true);
  });
  test.each([
    [AsyncFunction, function () {}],
    [GeneratorFunction,  () => {}],
    [Function, function* () {}],
    [Function, async () => {}],
    [Promise, {then(){},catch(){}}],
    [Promise, Promise],
    [Object, []],
    [Number, '2'],
    [String, 2],
  ])("isValid(%p)(%p) return false", (a, b) => {
    expect(isValid(a)(b)).toBe(false);
  });
});



describe("ArrayOf and objectOf", () => {
  test("ArrayOf", () => {
    expect(() => {
      isValidOrThrow(arrayOf(Number))([1, 2]);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(arrayOf(Number))([1, 2,'3']);
    }).toThrow();
    expect(() => {
      isValidOrThrow(arrayOf(Number))(['1', 2,3]);
    }).toThrow();
  });
  test("objectOf", () => {
    expect(() => {
      isValidOrThrow(objectOf(Number))({ a: 1 });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(objectOf(Number))({ a: 1 , b:'b'});
    }).toThrow();
  });
});
