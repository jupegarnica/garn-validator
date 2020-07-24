import check from "garn-validator";
describe("check with enums", () => {
  test("optional", () => {
    expect(() => {
      check([undefined, 0])(undefined);
    }).not.toThrow();
    expect(() => {
      check([undefined, 0])(0);
    }).not.toThrow();
    expect(() => {
      check([undefined, 0])(null);
    }).toThrow();
  });
  test("constructors", () => {
    expect(() => {
      check([String, Number])("12");
    }).not.toThrow();
    expect(() => {
      check([String, Number])(12);
    }).not.toThrow();
    expect(() => {
      check([String, Number])(true);
    }).toThrow();
  });
});
