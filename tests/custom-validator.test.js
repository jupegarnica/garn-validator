import isValidOrThrow from "garn-validator";


describe("check with custom validator", () => {
  test("you can return true or false", () => {
    expect(() => {
      isValidOrThrow(() => true)(33);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow(() => false)(33);
    }).toThrow();
  });
  test("you can throw a custom message", () => {
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
  test("you can throw a custom type of error", () => {
    expect(() => {
      isValidOrThrow((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
});
