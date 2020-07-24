import check from "garn-validator";
describe("check strings", () => {
  test("check with constructor", () => {
    expect(() => {
      check(String)("a string");
    }).not.toThrow();

    expect(() => {
      check(String)("");
    }).not.toThrow();

    expect(() => {
      check(String)("");
    }).not.toThrow();

    expect(() => {
      check(String)(``);
    }).not.toThrow();

    expect(() => {
      check(Number)("a string");
    }).toThrow();
  });
  test("check with primitives", () => {
    expect(() => {
      check("a string")("a string");
    }).not.toThrow();

    expect(() => {
      check("a string")("a string");
    }).not.toThrow();

    expect(() => {
      check("not")("a string");
    }).toThrow();
  });
  test("check with Regex", () => {
    expect(() => {
      check(/string/)("a string");
    }).not.toThrow();

    expect(() => {
      check(/(string)$/)("a string");
    }).not.toThrow();

    expect(() => {
      check(/^(string)/)("a string");
    }).toThrow();
  });
  test("check with custom validator", () => {
    expect(() => {
      check((val) => val.length === 8)("a string");
    }).not.toThrow();

    expect(() => {
      check((val) => val.includes("str"))("a string");
    }).not.toThrow();
  });
});
