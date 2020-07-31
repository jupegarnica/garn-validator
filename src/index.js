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

}
const throwAggregateError = (errors,{ type, value, path }) => {
  if (errors.length === 1) throw errors[0]
  throw new AggregateError(errors,formatErrorMessage(type, value, path));

}


const onFinishSuccessDefault = () => true;


const checkEnum = (conf, type, value, root, keyName, path) => {
  let errors = [];
  let valid = type.some((_type) => {
    try {
      let valid = isValidType(conf, _type, value, root, keyName, path);
      if (valid) return true;
      throwError({type:_type, value, root, keyName, path});
    } catch (error) {
      errors.push(error);
      return false;
    }
  })
  if (valid) return true;
  throwAggregateError(errors,{ type, value, path , kind:'enum'});
};

const defaultConfiguration = {
  collectAllErrors: false,
  onFinishSuccess: onFinishSuccessDefault,
  onFinishWithErrors: throwAggregateError,
};

export const checkShape = (conf, schema, object, path = []) => {
  if (!(object instanceof Object ||  typeof object === "string")) {
    return throwError({ type: schema, value: object });
  }

  let requiredErrors = [];
  const requiredKeys = Object.keys(schema).filter(isRequiredKey);
  for (const keyName of requiredKeys) {
    try {
      const currentPath = [...path, keyName];
      let valid = isValidType(
        conf,
        schema[keyName],
        object[keyName],
        object,
        keyName,
        currentPath
      );
      if (valid) continue;
      return throwError({
        type: schema[keyName],
        value: object[keyName],
        path: currentPath,
      });
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
      let valid = isValidType(
        conf,
        [undefined, schema[keyName]],
        object[keyNameStripped],
        object,
        keyNameStripped,
        currentPath
      );
      if (valid) continue;
      return throwError({
        type: schema[keyName],
        value: object[keyNameStripped],
        path: currentPath,
      });
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

        let valid = isValidType(
          conf,
          schema[regexpString],
          object[keyName],
          object,
          keyName,
          currentPath
        );
        if (valid) continue;
        return throwError({
          type: schema[regexpString],
          value: object[keyName],
          path: currentPath,
        });
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
    throw errors[0] ;
  }
  if (errors.length > 0) {
    throwAggregateError(errors,{ type:schema, value:object, kind:'schema' }) ;
  }
  return true;
};

const isValidType = (
  conf = defaultConfiguration,
  type,
  value,
  root,
  keyName,
  path
) => {
  const kind = whatTypeIs(type);
  switch (kind) {
    case "regex":
      return checkRegExp(type, value);
    case "primitive":
      return value === type;
    case "constructor":
      return checkConstructor(type, value);
    case "enum":
      return checkEnum(conf, type, value, root, keyName, path);
    case "schema":
      checkShape(conf, type, value, path);
      // checkSchema will throw if invalid in each each key
      return true;
    case "function":
      return type(value, root, keyName);

    default:
      return false;
  }
};

const run = (conf) => (...types) => (value) => {
  const errors = [];
  for (const type of types) {
    try {
      const valid = isValidType(conf, type, value);
      if (valid) continue;
      throw throwError({ type, value });
    } catch (error) {
      errors.push(...parseToArray(error));

      if (!conf.collectAllErrors) break;
    }
  }
  if (errors.length > 0) {
    return conf.onFinishWithErrors(errors,{type:types, value});
  }
  return conf.onFinishSuccess();
};

const config = ({
  collectAllErrors = false,
  onFinishSuccess = onFinishSuccessDefault,
  onFinishWithErrors = throwAggregateError,
} = defaultConfiguration) =>
  run({  collectAllErrors, onFinishSuccess, onFinishWithErrors });


const logErrorsAndReturnFalse = (errors) => {
  errors.forEach(e => console.error(e) );
  return false;
}


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

export const isValidOrThrow = config({});

export const arrayOf = (type) => isValidOrThrow(Array, { [/^\d$/]: type });
export const objectOf = (type) => isValidOrThrow(Object, { [/./]: type });

export default isValidOrThrow;
