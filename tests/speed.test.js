import isValidOrThrow from "garn-validator";
import { massiveObj1Mb } from "./data.js";


describe("speed tests", () => {
  describe("check primitives", () => {
    test("check with constructor", () => {
      const start = Date.now();
      isValidOrThrow(Number)(2); // not throw, all ok
      const end = Date.now();
      const delta = end - start;
      // console.log("check with constructor", delta);
      expect(delta).toBeLessThanOrEqual(2);
    });
    test("check with regex", () => {
      const start = Date.now();
      isValidOrThrow(/\d$/)("333"); // not throw, all ok
      const end = Date.now();
      const delta = end - start;
      //  console.log("check with regex", delta);
      expect(delta).toBeLessThanOrEqual(2);
    });
    test("check with custom validator", () => {
      const start = Date.now();
      isValidOrThrow((v) => v.length === 3)("333"); // not throw, all ok
      const end = Date.now();
      const delta = end - start;
      //  console.log("check with custom validator", delta);
      expect(delta).toBeLessThanOrEqual(2);
    });
  });

  describe("check objects recursively", () => {
    const obj = {
      a: 1,
      deep: {
        x: "x",
        deeper: {
          y: "y",
          method: (v) => console.log(v),
          user: {
            name: "garn",
            city: {
              name: "narnia",
              cp: 46001,
              country: "ESP",
            },
          },
        },
      },
    };
    const schema = {
      a: Number,
      deep: {
        x: (val, root, key) => key === val,
        deeper: {
          y: "y",
          method: Function,
          user: {
            name: String,
            city: {
              name: (v) => v.length > 3,
              cp: [Number, String],
              country: ["ESP", "UK"],
            },
          },
        },
      },
    };
    test("check big object with a valid schema", () => {
      const start = Date.now();

      isValidOrThrow(schema)(obj); // not throw, all ok
      const end = Date.now();
      const delta = end - start;
      // console.log("check big object", delta);
      expect(delta).toBeLessThanOrEqual(2);
    });
    test.skip("check massive object with a valid schema", () => {
      const schema = {
        [/./]: {
          [/./]: () => true,
        },
      };
      const start = Date.now();

      isValidOrThrow(schema)(massiveObj1Mb); // not throw, all ok
      const end = Date.now();
      const delta = end - start;
      // console.log("check massive object", delta);
      expect(delta).toBeLessThanOrEqual(1000); // usually takes 500ms but in node 8.x is slower
    });
  });
  describe("Stops in first fail", () => {
    jest.spyOn(globalThis.console, 'info')
    test("should stops in first fail", () => {
      const schema = {
        b: () => false,
        a: () => console.info("I run?"),
      };
      try {
        isValidOrThrow(schema)({ a: 1, b: 2 });
      } catch (error) {}
      expect(globalThis.console.info).not.toHaveBeenCalled();
    });
    test.skip("should be fast", () => {
      const schema = {
        [/./]: () => false,
        [/.*/]: () => console.log("I run?"),
      };
      const start = Date.now();

      try {
        isValidOrThrow(schema)(massiveObj1Mb);
      } catch (error) {}
      const end = Date.now();
      const delta = end - start;
      expect(globalThis.console.log).not.toHaveBeenCalled();
      expect(delta).toBeLessThanOrEqual(50);
    });
  });

  // describe.skip("1000 validations", () => {
  //   test.each([
  //     [Number, 2],
  //     [String, "str"],
  //     ["str", "str"],
  //     [/./, "str"],
  //     [() => true, ""],
  //     [{ a: 1 }, { a: 1 }],
  //     [[Number, String], 1],
  //   ])("not failing with %p", (type, value) => {
  //     const start = Date.now();
  //     for (let index = 0; index < 1000; index++) {
  //       isValidOrThrow(type)(value);
  //     }
  //     const end = Date.now();
  //     const delta = end - start;
  //     // console.log("check with constructor", delta);
  //     expect(delta).toBeLessThanOrEqual(2);
  //   });
  //   test.each([
  //     [Number, true],
  //     [String, true],
  //     ["str", true],
  //     [/./, true],
  //     [() => true, true],
  //     [{ a: 1 }, true],
  //     [[Number, String], true],
  //   ])(" failing with %p", (type, value) => {
  //     const start = Date.now();
  //     for (let index = 0; index < 1000; index++) {
  //       try {
  //         isValidOrThrow(type)(value);
  //       } catch (error) {}
  //     }
  //     const end = Date.now();
  //     const delta = end - start;
  //     // console.log("check with constructor", delta);
  //     expect(delta).toBeLessThanOrEqual(2);
  //   });
  // });
});
