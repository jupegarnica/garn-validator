import {
  hasErrors,
  isValid,
  isValidOrLog,
  isValidOrLogAll,
  TypeValidationError,
  Integer,
  // Numeric,
  SafeNumber,
  mustBe,
  Positive,
  and
} from "garn-validator";

try {

  const isValidPassword = mustBe(
    String, //  must be String
    (str) => str.length >= 8, // and length >= 8
    /[a-z]/, // and have at least one lowercase
    /[A-Z]/, // and have at least one uppercase
    /[0-9]/, // and have at least one digit
    /[-_/!¡?¿$%&/()]/ // and have at least one especial character
  );

  isValidPassword("12345Aa?"); // returns "12345Aa?"

  const isValidName = mustBe(String, (name) => name.length > 3).or("anonymous"); // will auto correct to 'anonymous' if fails

  // isValidName("qw"); // fails

  const isValidAge = mustBe(
    Number,
    (age) => age > 18,
    (age) => age < 40
  );

  // isValidAge(15); // fails

  // composition

  const isValidUser = mustBe({
    name: isValidName,
    age: isValidAge,
    password: isValidPassword,
    country: ["ES", "UK"], // 'ES' or 'UK'
  });
  const newUser = isValidUser({
    name: "g", // will be fixed
    age: 38,
    password: "12345zZ?",
    country: "ES",
  }); // ok
  console.log(newUser);
  // return {
  //   name: "anonymous",
  //   age: 38,
  //   password: "12345zZ?",
  //   country: "ES",
  // }

  const anotherUser = isValidUser({
    name: "garn",
    age: 38,
    password: "1234", // incorrect
    country: "ES",
  }); // it throws
} catch (error) {
  console.log(error.message);
}
