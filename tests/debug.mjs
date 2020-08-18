import {  mustBe,  arrayOf,  and,  Integer,  Numeric, Positive, Lowercase,   before} from "garn-validator";

let Schema = {
    name: Lowercase,
    birthday: before(new Date()),
    height: and(Number, Positive, Integer),
    creditCard: Numeric,
    books_id: arrayOf(String)
}

let data = {
  name: 'garn',
  birthday: '1982-03-16',
  height: 170,
  creditCard:'42424242424242',
  books_id:['123','321']
}

let user = mustBe(Schema).or(null)(data);

console.log(user);
