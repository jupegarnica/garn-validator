import { isValidOrThrow, arrayOf, objectOf } from 'garn-validator'

describe("ArrayOf and objectOf", () => {
  test("ArrayOf", () => {
    expect(() => {
      isValidOrThrow(arrayOf(Number))([1, 2]);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(arrayOf(Number))([1, 2, "3"]);
    }).toThrow();
    expect(() => {
      isValidOrThrow(arrayOf(Number))(["1", 2, 3]);
    }).toThrow();
  });
  test("objectOf", () => {
    expect(() => {
      isValidOrThrow(objectOf(Number))({ a: 1 });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(objectOf(Number))({ a: 1, b: "b" });
    }).toThrow();
  });
});
