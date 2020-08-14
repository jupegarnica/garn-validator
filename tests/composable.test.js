import mustBe, {
  TypeValidationError,
  mustBeOrThrowAll,
  SerieValidationError,
  hasErrors,
  isValidOrLog,
  isValidOrLogAll,
  isValid,
  EnumValidationError,
} from "garn-validator";
describe("composable", () => {
  describe("basics", () => {
    test("should work", () => {
      expect(mustBe(mustBe(Number))(1)).toBe(true);
    });
    test("should fail", () => {
      let validator = mustBe(Number);

      try {
        mustBe(validator)("2");
        throw "mec";
      } catch (error) {
        expect(error).toBeInstanceOf(TypeValidationError);
        expect(error.message).toMatch("Number");
      }
    });
    test("should fail with AggregateError collecting all errors", () => {
      let validator = mustBe(Number, String);

      try {
        mustBeOrThrowAll(validator)(null);
        throw "mec";
      } catch (error) {
        expect(error).toBeInstanceOf(SerieValidationError);
        expect(error.message).toMatch("serie Number,String");
        expect(error.errors.length).toBe(2);
      }
    });
    test("should fail with TypeValidationError collecting one error", () => {
      let validator = mustBeOrThrowAll(Number, String);

      try {
        mustBe(validator)(null);
        throw "mec";
      } catch (error) {
        expect(error).toBeInstanceOf(TypeValidationError);
        expect(error.message).not.toMatch("Number,String");
        expect(error.message).toMatch("Number");
        expect(error.errors).toBe(undefined);
      }
    });
  });
  describe("composable errors", () => {
    let validator = mustBe(Number, String);
    test("the validator should throw the path error depending of it relative value", () => {
      try {
        validator(null);
        throw "mec";
      } catch (error) {
        expect(error.raw.path).toEqual([]);
      }
    });
    test("should not rewrite user custom errors", () => {
      let validator = mustBe(Number, (num) => {
        if (num > 0) throw new RangeError("ups");
      });

      try {
        mustBe({ a: validator })({ a: 1 });
        throw "mec";
      } catch (error) {
        expect(error).toBeInstanceOf(RangeError);
        expect(error.raw).toBeUndefined();
      }
    });
    test("should not rewrite user custom errors inside aggregateError", () => {
      let validator = mustBe(Number, (num) => {
        if (num > 0) throw new RangeError("ups");
      }, null);

      try {
        mustBeOrThrowAll({ a: validator })({ a: 1 });
        throw "mec";
      } catch (error) {

        expect(error.errors[0]).toBeInstanceOf(RangeError);

      }
    });
    test("should rewrite errors injecting the new nested path", () => {
      try {
        mustBe({ a: validator })({ a: null });
        throw "mec";
      } catch (error) {
        expect(error.raw.path).toEqual(["a"]);
      }
    });
    test("should rewrite no matter how deep is the validation", () => {
      try {
        mustBe({ a: { b: { c: { d: validator } } } })({
          a: { b: { c: { d: null } } },
        });
        throw "mec";
      } catch (error) {
        expect(error.raw.path).toEqual(["a", "b", "c", "d"]);
      }
    });
    test("should all errors", () => {
      try {
        throw hasErrors({ a: { b: { c: { d: validator, e: validator } } } })({
          a: { b: { c: { d: null } } },
        });
      } catch (errors) {
        errors.forEach((error) => {
          expect(error.message).toMatch(/\/a\/b\/c\/[de]/);
        });
      }
    });
    test("should work rewrite path checking schemas inside schemas", () => {
      let isValidPerson = mustBe({ age: Number });

      try {
        mustBe({
          user: isValidPerson,
        })({
          user: {
            age: "33",
          },
        });
      } catch (error) {
        expect(error.raw.path).toEqual(["user", "age"]);
      }
    });
    test("should work in circular objects", () => {
      let isValidPerson = mustBe({ age: Number });
      let obj = {
        user: {
          age: "33",
        },
      };
      obj.friend = obj.user;
      try {
        throw hasErrors({
          friend: isValidPerson,
          user: isValidPerson,
        })(obj);
      } catch (errors) {
        errors.forEach((error) => {
          expect(error.message).toMatch(/\/(user|friend)\/age/);
        });
      }
    });
    test("should rewrite path of EnumValidationError", () => {
      let isValidPerson = mustBe({ age: [20, 30] });
      try {
        mustBeOrThrowAll({
          friend: isValidPerson,
        })({ friend: { age: 100 } });
      } catch (error) {
        expect(error.raw.path).toEqual(["friend", "age"]);
      }
    });
    test("should rewrite path of SchemaValidationError", () => {
      let isValidPerson = mustBe({
        tel: { num: Number, prefix: String },
      });
      try {
        mustBeOrThrowAll({
          friend: isValidPerson,
        })({ friend: { tel: { num: "19872", prefix: 19 } } });
      } catch (error) {
        expect(error.raw.path).toEqual(["friend", "tel"]);
      }
    });
    test("should rewrite path of SerieValidationError", () => {
      let isValidPerson = mustBe(Number, String);
      try {
        mustBeOrThrowAll({
          friend: isValidPerson,
        })({ friend: null });
      } catch (error) {
        expect(error.raw.path).toEqual(["friend"]);
      }
    });
    test("should rewrite path even is nested", () => {
      let isInteger = mustBe(Number, Number.isInteger);
      let isValidTelephone = mustBe({ num: isInteger });
      let isValidCountry = isValid(String, /^[A-Z]{3,}$/u);

      let isValidPerson = mustBe({
        tel: isValidTelephone,
        country: isValidCountry,
      });

      try {
        mustBeOrThrowAll({
          friend: isValidPerson,
        })({ friend: { tel: { num: "19872" }, country: "ESP" } });
      } catch (error) {
        expect(error.raw.path).toEqual(["friend", "tel", "num"]);
      }
    });
  });

  describe("Should inherit behavior", () => {
    test("should work", () => {
      let validator = hasErrors(Number, String);

      try {
        mustBe(validator)(null);
        throw "mec";
      } catch (error) {
        expect(error).toBeInstanceOf(TypeValidationError);
        expect(error.message).not.toMatch("Number,String");
        expect(error.message).toMatch("Number");
        expect(error.errors).toBe(undefined);
      }
    });
    test("should not log anything", () => {
      jest.spyOn(globalThis.console, "error");
      let validator = isValidOrLog(Number, String);
      let errors = hasErrors(validator)(null);
      expect(errors.length).toBe(2);
      expect(globalThis.console.error).toHaveBeenCalledTimes(0);
    });
    describe("should work not matter what", () => {
      let isInteger = isValid(Number, Number.isInteger);
      let isValidTelephone = mustBeOrThrowAll({ num: isInteger });
      let isValidCountry = hasErrors(String, /^[A-Z]{3,}$/u);

      let isValidPerson = mustBe({
        tel: isValidTelephone,
        country: isValidCountry,
      });

      test("normal behavior", () => {
        expect(isInteger(2)).toBe(true);
        expect(isInteger("2")).toBe(false);
      });

      test("inherits behavior", () => {
        expect(() => {
          isValidTelephone({ num: "123" });
        }).toThrow(SerieValidationError);
      });

      test("rewrite behavior ", () => {
        expect(isValid(isValidTelephone)({ num: "123" })).toBe(false);
        expect(isValid(isValidTelephone)({ num: 123 })).toBe(true);
      });

      test("throw one error", () => {
        expect(() => {
          isValidPerson({ tel: { num: "123" }, country: "esp" });
        }).toThrow(TypeValidationError);
      });
    });
  });

  describe("usage", () => {
    test("simple", () => {
      const isValidNumber = mustBe(Number);
      expect(() => {
        isValidNumber(2);
      }).not.toThrow();

      expect(() => {
        isValidNumber("2");
      }).toThrow();
    });
    test("multiple", () => {
      expect(() => {
        const isGood = mustBe(
          Number,
          (v) => v < 1990,
          (v) => v > 1980,
          (v) => v % 2 === 0
        );
        isGood(1982);
      }).not.toThrow();
      expect(() => {
        isGood(2001);
      }).toThrow();
      expect(() => {
        isGood(1978);
      }).toThrow();
    });
    test("with schema", () => {
      const validUser = mustBe({
        name: String,
        age: (v) => v > 18,
        password: String,
      });
      expect(() => {
        validUser({
          name: "garn",
          age: 38,
          password: "1234",
        });
      }).not.toThrow();
      expect(() => {
        validUser({
          name: "garn",
          age: 18,
          password: "1234",
        });
      }).toThrow();
    });
    test("with complex schema", () => {
      const isValidPassword = mustBe(
        String,
        /[a-z]/,
        /[A-Z]/,
        /[0-9]/,
        /[-_/!"·$%&/()]/
      );
      const isValidName = mustBe(String, (name) => name.length >= 3);
      const isValidAge = mustBe(
        Number,
        (age) => age > 18,
        (age) => age < 40
      );

      const validUser = mustBe({
        name: isValidName,
        age: isValidAge,
        password: isValidPassword,
      });
      expect(() => {
        validUser({
          name: "garn",
          age: 38,
          password: "12345aA-",
        });
      }).not.toThrow();
      expect(() => {
        validUser({
          name: "garn",
          age: 38,
          password: "1234",
        });
      }).toThrow();
    });
    test("nested", () => {
      const validUser = mustBe({
        name: mustBe(String, (name) => name.length >= 3),
        age: mustBe(
          Number,
          (age) => age > 18,
          (age) => age < 40
        ),
        password: mustBe(
          String,
          /[a-z]/,
          /[A-Z]/,
          /[0-9]/,
          /[-_/!"·$%&/()]/
        ),
      });
      expect(() => {
        validUser({
          name: "garn",
          age: 38,
          password: "12345aA-",
        });
      }).not.toThrow();
      expect(() => {
        validUser({
          name: "garn",
          age: 38,
          password: "1234",
        });
      }).toThrow();
    });
  });
});
