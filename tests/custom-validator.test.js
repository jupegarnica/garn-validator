import isValidOrThrow from "garn-validator";

describe("Custom validator", () => {
  test("you can return true or false", () => {
    expect(() => {
      isValidOrThrow(() => true)(33);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow(() => false)(33);
    }).toThrow();
  });
  test("you can throw a custom message", () => {
    try {
      isValidOrThrow(() => {
        throw "ups";
      })(33);
      throw 'mec'
    } catch (error) {
      expect(error).toBe('ups');

    }
  });
  test("by default throws TypeError", () => {
    try {
      isValidOrThrow(Boolean)(33);
      throw 'mec'
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)

    }
  });
  test("you can throw a custom type of error", () => {
    try {
      isValidOrThrow((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
      throw 'mec'
    } catch (error) {
      expect(error).toBeInstanceOf(RangeError)
      expect(error).not.toBeInstanceOf(TypeError)

    }

  });
});
