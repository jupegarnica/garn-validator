import isValidOrThrow from "garn-validator";


describe("check with enums", () => {
  test("optional", () => {
    expect(() => {
      isValidOrThrow([undefined, 0])(undefined);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow([undefined, 0])(0);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow([undefined, 0])(null);
    }).toThrow();
  });
  test("constructors", () => {
    expect(() => {
      isValidOrThrow([String, Number])("12");
    }).not.toThrow();
    expect(() => {
      isValidOrThrow([String, Number])(12);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow([String, Number])(true);
    }).toThrow();
  });
  test("should pass even if some throws", () => {
    expect(() => {
      isValidOrThrow([()=> {throw 'ups'}, Number])(1);
    }).not.toThrow();

  });
  test("should throw AggregateError if none pass", () => {
    expect(() => {
      try {
        isValidOrThrow([()=> {throw 'ups'}, String])(1);
      } catch (error) {
        expect(error.errors.length).toBe(2)
        throw error
      }
    }).toThrow(AggregateError);

  });
});
