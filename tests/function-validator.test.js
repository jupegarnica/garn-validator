import isValidOrThrow from "garn-validator";

describe("check with custom validator", () => {
  test("can return true or false ", () => {
    expect(() => {
      isValidOrThrow(() => true)(33);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(() => false)(33);
    }).toThrow();
  });
  test("can throw a custom error", () => {
    expect(() => {
      isValidOrThrow(() => {
        throw "ups";
      })(33);
    }).toThrow("ups");
  });
  test("by default throws TypeError", () => {
    expect(() => {
      isValidOrThrow(Boolean)(33);
    }).toThrow(TypeError);
  });
  test("can throw a custom type of error", () => {
    expect(() => {
      isValidOrThrow((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
});
