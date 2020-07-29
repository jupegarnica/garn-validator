import isValidOrThrow from "garn-validator";
import { numbers } from "./data.js";

describe("check numbers", () => {
  test.each(numbers)(
    'number %f must be Number',
    (input) => {
      expect(() => {
        isValidOrThrow(Number)(input);
      }).not.toThrow();
    }
  );
  test.each(numbers)(
    'number %f is not Boolean',
    (input) => {
      expect(() => {
        isValidOrThrow(Boolean)(input);
      }).toThrow();
    }
  );
  test('BigInts against constructor', () => {
    expect(() => {
      isValidOrThrow(Number)(1n);
    }).toThrow();
    expect(() => {
      isValidOrThrow(BigInt)(1n);
    }).not.toThrow();

  });
  test('BigInts against primitive', () => {
    expect(() => {
      isValidOrThrow(1n)(2n);
    }).toThrow();
    expect(() => {
      isValidOrThrow(1n)(1n);
    }).not.toThrow();

  });
  test('BigInts against custom validator', () => {
    expect(() => {
      isValidOrThrow((val) => val > 0)(33n);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow((val) => val < 0)(33n);
    }).toThrow();
    expect(() => {
      isValidOrThrow((val) => val === 33)(33n);
    }).toThrow();

  });
  test("check with custom validator", () => {
    expect(() => {
      isValidOrThrow((val) => val > 0)(33);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow((val) => val < 0)(33);
    }).toThrow();
  });
});
