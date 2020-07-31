import {
  stringToRegExp,
  checkConstructor,
  isRegExp,
  checkRegExp,
  stringify,
  isRequiredKey,
  isOptionalKey,
  optionalRegex,
  parseToArray,
  whatTypeIs,
} from "./utils.js";

export const AsyncFunction = Object.getPrototypeOf(async function () {})
  .constructor;
export const GeneratorFunction = Object.getPrototypeOf(function* () {})
  .constructor;

const formatErrorMessage = (type, value, path = []) =>
  `${path.length ? `on path /${path.join("/")} ` : ""}value ${stringify(
    value
  )} do not match type ${stringify(type)}`;

const throwError = ({ type, value, path }) => {
  throw new TypeError(formatErrorMessage(type, value, path));
};
const throwErrors = (errors, { type, value, path }) => {
  if (errors.length === 1) throw errors[0];
  throw new AggregateError(errors, formatErrorMessage(type, value, path));
};

const validOrThrow = (input, data) => {
  if (input) return true;
  throwError(data);
};

const onFinishSuccessDefault = () => true;

const defaultConfiguration = {
  collectAllErrors: false,
  onFinishSuccess: onFinishSuccessDefault,
  onFinishWithErrors: throwErrors,
};

export const validSchemaOrThrow = (conf, schema, object, path = []) => {
  if (!(object instanceof Object || typeof object === "string")) {
    return throwError({ type: schema, value: object });
  }

  let requiredErrors = [];
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);
  for (const keyName of requiredKeys) {
    try {
      const currentPath = [...path, keyName];
      isValidTypeOrThrow(
        conf,
        schema[keyName],
        object[keyName],
        object,
        keyName,
        currentPath
      );
    } catch (error) {
      if (!conf.collectAllErrors) {
        throw error;
      }
      requiredErrors.push(...parseToArray(error));
    }
  }
  const optionalError = [];
  const optionalKeys = Object.keys(schema)
    .filter(isOptionalKey)
    .filter((key) => !requiredKeys.includes(key.replace(optionalRegex, "")));
  for (const keyName of optionalKeys) {
    try {
      const keyNameStripped = keyName.replace(optionalRegex, "");
      const currentPath = [...path, keyNameStripped];
      isValidTypeOrThrow(
        conf,
        [undefined, schema[keyName]],
        object[keyNameStripped],
        object,
        keyNameStripped,
        currentPath
      );
    } catch (error) {
      if (!conf.collectAllErrors) {
        throw error;
      }
      optionalError.push(...parseToArray(error));
    }
  }
  let regexErrors = [];
  const regexKeys = Object.keys(schema).filter(isRegExp);
  const untestedKeys = Object.keys(object)
    .filter((key) => !requiredKeys.includes(key))
    .filter(
      (key) =>
        !optionalKeys.map((k) => k.replace(optionalRegex, "")).includes(key)
    );
  for (const regexpString of regexKeys) {
    let keys = untestedKeys.filter((keyName) =>
      stringToRegExp(regexpString).test(keyName)
    );
    for (const keyName of keys) {
      try {
        const currentPath = [...path, keyName];
        isValidTypeOrThrow(
          conf,
          schema[regexpString],
          object[keyName],
          object,
          keyName,
          currentPath
        );
      } catch (error) {
        if (!conf.collectAllErrors) {
          throw error;
        }
        regexErrors.push(...parseToArray(error));
      }
    }
  }
  const errors = [...regexErrors, ...requiredErrors, ...optionalError];
  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length > 0) {
    throwErrors(errors, {
      type: schema,
      value: object,
      kind: "schema",
    });
  }
  return true;
};

const validCustomValidatorOrThrow = (fn, value, root, keyName, path) =>
  validOrThrow(fn(value, root, keyName), {
    type: fn,
    value,
    root,
    keyName,
    path,
  });
const validConstructorOrThrow = (type, value, root, keyName, path) =>
  validOrThrow(checkConstructor(type, value), {
    type,
    value,
    root,
    keyName,
    path,
  });
const validPrimitiveOrThrow = (type, value, root, keyName, path) =>
  validOrThrow(value === type, { type, value, root, keyName, path });

const validRegExpOrThrow = (type, value, root, keyName, path) =>
  validOrThrow(checkRegExp(type, value), { type, value, root, keyName, path });

const validEnumOrThrow = (conf, types, value, root, keyName, path) => {
  let errors = [];
  let valid = types.some((_type) => {
    try {
      return validOrThrow(
        isValidTypeOrThrow(conf, _type, value, root, keyName, path),
        { type: _type, value, root, keyName, path }
      );
    } catch (error) {
      errors.push(error);
      return false;
    }
  });
  if (valid) return true;
  throwErrors(errors, { type: types, value, path, kind: "enum" });
};
const isValidTypeOrThrow = (
  conf,
  type,
  value,
  root,
  keyName,
  path
) => {
  switch (whatTypeIs(type)) {
    case "regex":
      return validRegExpOrThrow(type, value, root, keyName, path);
    case "primitive":
      return validPrimitiveOrThrow(type, value, root, keyName, path);
    case "constructor":
      return validConstructorOrThrow(type, value, root, keyName, path);
    case "enum":
      return validEnumOrThrow(conf, type, value, root, keyName, path);
    case "schema":
      return validSchemaOrThrow(conf, type, value, root, keyName, path);
    case "function":
      return validCustomValidatorOrThrow(type, value, root, keyName, path);

    // default:
    //   throw new Error("this never happens");
  }
};

const run = (conf) => (...types) => (value) => {
  const errors = [];
  for (const type of types) {
    try {
      isValidTypeOrThrow(conf, type, value);
    } catch (error) {
      errors.push(...parseToArray(error));
      if (!conf.collectAllErrors) break;
    }
  }
  if (errors.length > 0) {
    return conf.onFinishWithErrors(errors, { type: types, value });
  }
  return conf.onFinishSuccess();
};

const config = ({
  collectAllErrors = false,
  onFinishSuccess = onFinishSuccessDefault,
  onFinishWithErrors = throwErrors,
} = defaultConfiguration) =>
  run({ collectAllErrors, onFinishSuccess, onFinishWithErrors });

const logErrorsAndReturnFalse = (errors) => {
  errors.forEach((e) => console.error(e));
  return false;
};

export const isValid = config({
  onFinishWithErrors: () => false,
  // collectAllErrors: false, // default
});

export const isValidOrLog = config({
  onFinishWithErrors: logErrorsAndReturnFalse,
  // collectAllErrors: false, // default
});

export const hasErrors = config({
  onFinishWithErrors: (errors) => errors,
  onFinishSuccess: () => null,
  collectAllErrors: true,
});

export const isValidOrLogAllErrors = config({
  onFinishWithErrors: logErrorsAndReturnFalse,
  // onFinishSuccess: () => true, // default
  collectAllErrors: true,
});

export const isValidOrThrowAllErrors = config({
  collectAllErrors: true,
});

export const isValidOrThrow = config();

export const arrayOf = (type) => isValidOrThrow(Array, { [/^\d$/]: type });
export const objectOf = (type) => isValidOrThrow(Object, { [/./]: type });

export default isValidOrThrow;
