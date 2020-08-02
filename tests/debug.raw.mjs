import { isValidOrThrow } from "garn-validator";

const schema = {
  name: /^[a-z]{3,}$/,
  age: (age) => age > 18,
  car: {
    brand: ["honda", "toyota"],
    date: Date,
    country: {
      name: String,
    },
    [/./]: () => {
      throw new EvalError("unexpected key");
    },
  },
  optional$: true,
  [/./]: () => false,
};
const obj = {
  name: "garn",
  age: 19,
  optional: true,
  car: {
    brand: "honda",
    date: new Date("1982-01-01"),
    country: {
      name: "Japan",
    },
  },
};
isValidOrThrow(schema)(obj);
