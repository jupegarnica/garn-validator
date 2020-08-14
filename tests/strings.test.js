import mustBe from "garn-validator";
import { strings } from "./data.js";


describe("check strings", () => {
  test.each(strings)("%s should be String", (input) => {
    expect(() => {
      mustBe(String)(input);
    }).not.toThrow();
  });
  test('works with regex', () => {
    expect(() => {
      mustBe(/./)(true);
    }).toThrow();
    expect(() => {
      mustBe(/./)('true');
    }).not.toThrow();

  });
  test.each(strings)("%s should not be Number", (input) => {
    expect(() => {
      mustBe(Number)(input);
    }).toThrow();
  });
  let [, ...strs] = strings;
  test.each(strs)("%s should be 'str'", (input) => {
    expect(() => {
      mustBe("str")(input.replace('"', ""));
    }).not.toThrow();
    expect(() => {
      mustBe("a")(input);
    }).toThrow();
  });
  test.each(strs)("should match regex '/^str/' value %s  ", (input) => {
    expect(() => {
      mustBe(/^str/)(input);
    }).not.toThrow();
    expect(() => {
      mustBe(/string/)(input);
    }).toThrow();
  });


  test.each(strs)("custom validator value %s ", (input) => {
    expect(() => {
      mustBe(v => v.length === 3 ||  v.length === 4)(input);
    }).not.toThrow();
    expect(() => {
      mustBe(v => v === '')(input);
    }).toThrow();

  });
});
