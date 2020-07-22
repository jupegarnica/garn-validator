import check from "garn-validator";
import massiveObj1Mb from '../data/data.js';

describe("speed tests", () => {
  describe("check primitives", () => {

    test("check with constructor", () => {
      const start = Date.now();
      check(Number)(2); // not throw, all ok
      const end = Date.now();
      const delta = end - start;
      // console.log("check with constructor", delta);
      expect(delta).toBeLessThan(3);
    });
     test("check with regex", () => {
       const start = Date.now();
       check(/\d$/)('333'); // not throw, all ok
       const end = Date.now();
       const delta = end - start;
      //  console.log("check with regex", delta);
       expect(delta).toBeLessThan(3);
      });
         test("check with custom validator", () => {
       const start = Date.now();
       check(v => v.length === 3)("333"); // not throw, all ok
       const end = Date.now();
       const delta = end - start;
      //  console.log("check with custom validator", delta);
       expect(delta).toBeLessThan(3);
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

      check(schema)(obj); // not throw, all ok
      const end = Date.now();
      const delta = end - start;
      // console.log("check big object", delta);
      expect(delta).toBeLessThan(3);
    });
    test("check massive object with a valid schema", () => {

      const schema = {
        [/./]: {
          [/./]: () => true,
        },
      };
      const start = Date.now();

      check(schema)(massiveObj1Mb); // not throw, all ok
      const end = Date.now();
      const delta = end - start;
      // console.log("check massive object", delta);
      expect(delta).toBeLessThan(1000);
    });
  });
});
