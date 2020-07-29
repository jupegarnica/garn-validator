import check from "garn-validator";
import { numbers } from "./data.js";

describe("check numbers", () => {
  test.each(numbers)(
    'number %f must be Number',
    (input) => {
      expect(() => {
        check(Number)(input);
      }).not.toThrow();
    }
  );
  test.each(numbers)(
    'number %f is not Boolean',
    (input) => {
      expect(() => {
        check(Boolean)(input);
      }).toThrow();
    }
  );
  test('BigInts against constructor', () => {
    expect(() => {
      check(Number)(1n);
    }).toThrow();
    expect(() => {
      check(BigInt)(1n);
    }).not.toThrow();

  });
  test('BigInts against primitive', () => {
    expect(() => {
      check(1n)(2n);
    }).toThrow();
    expect(() => {
      check(1n)(1n);
    }).not.toThrow();

  });
  test('BigInts against custom validator', () => {
    expect(() => {
      check((val) => val > 0)(33n);
    }).not.toThrow();

    expect(() => {
      check((val) => val < 0)(33n);
    }).toThrow();
    expect(() => {
      check((val) => val === 33)(33n);
    }).toThrow();

  });
  test("check with custom validator", () => {
    expect(() => {
      check((val) => val > 0)(33);
    }).not.toThrow();

    expect(() => {
      check((val) => val < 0)(33);
    }).toThrow();
  });
});
