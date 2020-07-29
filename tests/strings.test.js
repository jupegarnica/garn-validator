import check from "garn-validator";
import { strings } from "./data.js";
describe("check strings", () => {
  test.each(strings)("%s should be String", (input) => {
    expect(() => {
      check(String)(input);
    }).not.toThrow();
  });
  test.each(strings)("%s should not be Number", (input) => {
    expect(() => {
      check(Number)(input);
    }).toThrow();
  });
  let [, ...strs] = strings;
  test.each(strs)("value %s should be 'str'", (input) => {
    expect(() => {
      check("str")(input.replace('"', ""));
    }).not.toThrow();
    expect(() => {
      check("a")(input);
    }).toThrow();
  });
  test.each(strs)("should match regex '/^str/' value %s  ", (input) => {
    expect(() => {
      check(/^str/)(input);
    }).not.toThrow();
    expect(() => {
      check(/string/)(input);
    }).toThrow();
  });


  test.each(strs)("custom validator value %s ", (input) => {
    expect(() => {
      check(v => v.length === 3 ||  v.length === 4)(input);
    }).not.toThrow();
    expect(() => {
      check(v => v === '')(input);
    }).toThrow();

  });
});
