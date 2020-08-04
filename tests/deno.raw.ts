import { isValidOrThrow } from "garn-validator";


// import IsValidOrThrow from "garn-validator/src/index.d.ts";

// isValidOrThrow as typeof IsValidOrThrow;

// let n : string= isValidOrThrow(Number)(2);

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
isValidOrThrow(schema)(obj);
