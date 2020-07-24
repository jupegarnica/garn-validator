import check from "garn-validator";

describe("check with custom validator", () => {
  test("can return true or false ", () => {
    expect(() => {
      check(() => true)(33);
    }).not.toThrow();
    expect(() => {
      check(() => false)(33);
    }).toThrow();
  });
  test("can throw a custom error", () => {
    expect(() => {
      check(() => {
        throw "ups";
      })(33);
    }).toThrow("ups");
  });
  test("by default throws TypeError", () => {
    expect(() => {
      check(Boolean)(33);
    }).toThrow(TypeError);
  });
  test("can throw a custom type of error", () => {
    expect(() => {
      check((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
});
