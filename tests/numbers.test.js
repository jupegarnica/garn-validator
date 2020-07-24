import check from "garn-validator";

describe("check numbers", () => {
  test("check with constructor", () => {
    expect(() => {
      check(String)(33);
    }).toThrow();

    expect(() => {
      check(Number)(33);
    }).not.toThrow();
    expect(() => {
      check(Number)(NaN);
    }).not.toThrow();
    expect(() => {
      check(Number)(Infinity);
    }).not.toThrow();
    expect(() => {
      check(Number.isNaN)(NaN);
    }).not.toThrow();
    expect(() => {
      check(Number.isNaN)(1);
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
