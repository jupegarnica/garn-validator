import mustBe from "garn-validator";
import { numbers } from "./data.js";


describe("check numbers", () => {
  test.each(numbers)(
    'number %f must be Number',
    (input) => {
      expect(() => {
        mustBe(Number)(input);
      }).not.toThrow();
    }
  );
  test.each(numbers)(
    'number %f is not Boolean',
    (input) => {
      expect(() => {
        mustBe(Boolean)(input);
      }).toThrow();
    }
  );
  test('BigInts against constructor', () => {
    expect(() => {
      mustBe(Number)(1n);
    }).toThrow();
    expect(() => {
      mustBe(BigInt)(1n);
    }).not.toThrow();

  });
  test('BigInts against primitive', () => {
    expect(() => {
      mustBe(1)(1n);
    }).toThrow();
    expect(() => {
      mustBe(1n)(1n);
    }).not.toThrow();

  });
  test('BigInts against custom validator', () => {
    expect(() => {
      mustBe((val) => val > 0)(33n);
    }).not.toThrow();

    expect(() => {
      mustBe((val) => val < 0)(33n);
    }).toThrow();
    expect(() => {
      mustBe((val) => val === 33)(33n);
    }).toThrow();
    expect(() => {
      mustBe((val) => val == 33)(33n);
    }).not.toThrow();

  });
  test("check with custom validator", () => {
    expect(() => {
      mustBe((val) => val > 0)(33);
    }).not.toThrow();

    expect(() => {
      mustBe((val) => val < 0)(33);
    }).toThrow();
  });
});
