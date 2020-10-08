import mustBe from "garn-validator";

describe("Custom validator", () => {
  test("you can return true or false", () => {
    expect(() => {
      mustBe(() => true)(33);
    }).not.toThrow();

    expect(() => {
      mustBe(() => false)(33);
    }).toThrow();
  });
  test("you can throw a custom message", () => {
    try {
      mustBe(() => {
        throw "ups";
      })(33);
      throw 'mec'
    } catch (error) {
      expect(error).toBe('ups');

    }
  });
  test("by default throws TypeError", () => {
    try {
      mustBe(Boolean)(33);
      throw 'mec'
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)

    }
  });
  test("you can throw a custom type of error", () => {
    try {
      mustBe((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
      throw 'mec'
    } catch (error) {
      expect(error).toBeInstanceOf(RangeError)
      expect(error).not.toBeInstanceOf(TypeError)

    }

  });
  test("you can throw a custom type of error", () => {
    try {
      mustBe(function(e){return(null===e||void 0===e?void 0:e.length)>=2})(33);
      throw 'mec'
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
      // expect(error).not.toBeInstanceOf(TypeError)

    }

  });
});
