import isValidOrThrow from "garn-validator";
import { strings } from "./data.js";
describe("check strings", () => {
  test.each(strings)("%s should be String", (input) => {
    expect(() => {
      isValidOrThrow(String)(input);
    }).not.toThrow();
  });
  test.each(strings)("%s should not be Number", (input) => {
    expect(() => {
      isValidOrThrow(Number)(input);
    }).toThrow();
  });
  let [, ...strs] = strings;
  test.each(strs)("value %s should be 'str'", (input) => {
    expect(() => {
      isValidOrThrow("str")(input.replace('"', ""));
    }).not.toThrow();
    expect(() => {
      isValidOrThrow("a")(input);
    }).toThrow();
  });
  test.each(strs)("should match regex '/^str/' value %s  ", (input) => {
    expect(() => {
      isValidOrThrow(/^str/)(input);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(/string/)(input);
    }).toThrow();
  });


  test.each(strs)("custom validator value %s ", (input) => {
    expect(() => {
      isValidOrThrow(v => v.length === 3 ||  v.length === 4)(input);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(v => v === '')(input);
    }).toThrow();

  });
});
