import { mustBe } from "garn-validator";
// import { mustBe } from "https://deno.land/x/garn_validator/src/index.js";


// import mustBe from "garn-validator/src/index.d.ts";

// mustBe as typeof mustBe;

// let n : string= mustBe(Number)(2);

// console.log(n);

const schema = {
  name: /^[a-z]{3,10}$/,
  age: (age:any) => age > 18,
  car: {
    brand: ["honda", "toyota"],
    date: Date,
    country: {
      name: String,
    },
    ['/./']: () => {
      throw new EvalError("unexpected key");
    },
  },
  optional$: true,
  ['/./']: () => false,
};
const obj = {
  name: "garn",
  age: 19,
  optional: true,
  car: {
    brand: "honda",
    date: new Date("1982-01-01"),
    country: {
      name: "japan",
    },
  },
};
mustBe(schema)(obj);
