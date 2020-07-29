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
});
