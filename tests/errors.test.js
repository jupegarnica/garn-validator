import check from 'garn-validator'

describe('check errors',()=> {
  test("by default throws TypeError", () => {
    expect(() => {
      check(Boolean)(33);
    }).toThrow(TypeError);
  });
  test("Should throw meaningfull message", () => {
    expect(() => {
      check(1)(33);
    }).toThrow('value 33 do not match type 1');
  });
  test("should throw a custom type of error", () => {
    expect(() => {
      check((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
  test("should throw a custom type of error", () => {
    expect(() => {
      check((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow('ups');
  });
  test("should format the schema", () => {
    expect(() => {
      check({a:Number})(33);
    }).toThrow("value 33 do not match type {\"a\":\"function Number() { [native code] }\"}");
  });
  test("should format the value", () => {
    expect(() => {
      check({a:Number})({b:33});
    }).toThrow("value {\"b\":33} do not match type {\"a\":\"function Number() { [native code] }\"}");
  });
})
