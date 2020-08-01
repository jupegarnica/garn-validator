import { hasErrors } from "garn-validator";
const schema:any = {
  name: /^[a-z]{3,}$/,
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
const obj:any = {
  name: "garn",
  age: 19,
  optional: 1,
  car: {
    brand: "honda",
    date: new Date("1982-01-01"),
    country: {
      name: "Japan",
    },
  },
};

let errors = hasErrors(schema)(obj);

console.log(errors);
