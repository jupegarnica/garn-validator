// import { hasErrors } from "garn-validator";

// // isValid(Number, Boolean)(33);
// // let errors = hasErrors({ obj: { num: Number, str: String } })({ obj: { num: "2", str: 1 } })

// const obj = {
//   name: "Garn",
//   age: 18,
//   optional: false,
//   car: {
//     brand: "Honda",
//     date: "1982-01-01",
//     country: {
//       NAME: "Japan",
//     },
//   },
//   noValidKey: 1,
// };
// const schema = {
//   name: /^[a-z]{3,}$/,
//   age: (age) => age > 18,
//   car: {
//     brand: ["honda", "toyota"],
//     date: Date,
//     country: {
//       name: String,
//     },
//   },
//   optional$: true,
//   [/./]: () => {
//     throw new EvalError("unexpected key");
//   },
// };
// let errors = hasErrors(schema)(obj)
// // console.log(errors.map(e => e.message));

// let object = 'asdhsaljhsda'
// for (const key in object) {
//   const element = object[key];
//   console.log(key, element);
// }
