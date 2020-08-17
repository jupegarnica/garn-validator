import { stringify } from "../src/helpers.js";
import {
  mustBe,
  isValid,
  Numeric,
  asDate,
  Lowercase,
  between,
  and,
  not,
  or,
  arrayOf,
  objectOf,
} from "garn-validator";

describe("displayName", () => {
  test("should show validator displayName", () => {
    const isNumber = mustBe(Number);
    expect(stringify(isNumber)).toBe("mustBe(Number)");
    expect(stringify(isValid(null))).toBe("isValid(null)");
  });
  test("should show external displayName if present", () => {
    const isNumber = mustBe(Number);
    isNumber.displayName = "isNumber";
    expect(stringify(isNumber)).toBe("isNumber");
  });
  test("should show  custom validator displayName", () => {
    const isNumber = (value) => value instanceof Number;
    isNumber.displayName = "isNumber";
    expect(stringify(isNumber)).toBe("isNumber");
  });
  test("should show util displayName", () => {
    expect(stringify(Numeric)).toBe("Numeric");
  });
  test("should show util displayName 2", () => {
    expect(stringify(mustBe(Numeric))).toBe("mustBe(Numeric)");
  });
  test("should show asDate", () => {
    expect(stringify(mustBe(Lowercase))).toBe("mustBe(Lowercase)");
  });
  test("should show asDate", () => {
    expect(stringify(mustBe(asDate))).toBe("mustBe(asDate)");
  });
  test("should show dynamic displayName", () => {
    expect(stringify(mustBe(between(1, 3)))).toBe("mustBe(between(1,3))");
  });
  test("should work for and()", () => {
    expect(stringify(mustBe(and(Number, String)))).toBe(
      "mustBe(and(Number,String))"
    );
    expect(
      stringify(mustBe(and(mustBe(null), isValid(String, Lowercase))))
    ).toBe("mustBe(and(mustBe(null),isValid(String,Lowercase)))");
  });
  test("should work for not()", () => {
    expect(stringify(mustBe(not(Number)))).toBe(
      "mustBe(not(Number))"
    );
    expect(
      stringify(mustBe(not(isValid(String, Lowercase))))
    ).toBe("mustBe(not(isValid(String,Lowercase)))");
  });
  test("should work for or()", () => {
    expect(stringify(or(Number,String))).toBe(
      "or(Number,String)"
    );
    expect(
      stringify(mustBe(or(isValid(String, Lowercase))))
    ).toBe("mustBe(or(isValid(String,Lowercase)))");
  });
  test('should arrayOf', () => {
    expect(stringify(arrayOf(Numeric))).toBe("arrayOf(Numeric)");
  });
  test('should objectOf', () => {
    expect(stringify(objectOf(Numeric))).toBe("objectOf(Numeric)");
  });
});
