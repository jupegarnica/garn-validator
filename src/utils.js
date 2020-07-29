import util from "util";
const isProxy = util.types.isProxy;

export const checkConstructor = (type, val) =>
  (val !== undefined && val !== null && val.constructor === type) ||
    (Proxy === type && isProxy(val))

export const isClass = (fn) =>
  typeof fn === "function" &&
  /^\s*class\b/.test(fn.toString()) &&
  !isFunctionHacked(fn);

export const isFunction = (fn) =>
  typeof fn === "function" && !isClass(fn) && !isFunctionHacked(fn);

export const isFunctionHacked = (fn) =>
  typeof fn === "function" &&
  fn.toString.toString() !== "function toString() { [native code] }";

export const isCustomValidator = (f) =>
  f &&
  typeof f === "function" &&
  !isClass(f) &&
  (!f.name || f.name[0] === f.name[0].toLowerCase());

export function isConstructor(f) {
  if (!f) return false;
  // Not created with new
  if (f.name === "Symbol") return true;
  if (f.name === "BigInt") return true;

  // needs espacial params to be instantiated
  if (f.name === "Promise") return true;
  if (f.name === "DataView") return true;
  if (f.name === "Proxy") return true;
  if (f.name === "URL") return true;
  // detect custom validator (anonymous or its name starts with lowercase)
  if (isCustomValidator(f)) return false;
  if (isClass(f)) return true;
  try {
    new f();
    return true;
  } catch (err) {
    return false;
  }
}

export const whatTypeIs = (type) => {
  if (checkConstructor(Object, type)) return "schema";
  if (isPrimitive(type)) return "primitive";
  if (isCustomValidator(type)) return "function";
  if (Array.isArray(type)) return "enum";
  if (checkConstructor(RegExp, type)) return "regex";
  return "constructor";
  // if (isConstructor(type)) return "constructor";
  // throw new Error("Invalid type " + stringify(type));
};

export const parseToArray = (itemOrArray) => {
  if (Array.isArray(itemOrArray)) {
    return itemOrArray;
  } else {
    return [itemOrArray];
  }
};

// fails in ArrayBuffer
// export const isPrimitive = (value) => !(value instanceof Object) || (value.constructor === Number || value.constructor === String);
export const isPrimitive = (value) =>
  Object(value) !== value ||
  value.constructor === Number ||
  value.constructor === String;

const parser = () => {
  const seen = new WeakMap();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        const oldKey = seen.get(value);
        return `[circular reference] -> ${oldKey || "rootObject"}`;
      }
      seen.set(value, key);
    }
    if (typeof value === "function" && isConstructor(value)) {
      return value.name;
    }
    if (typeof value === "function") {
      return value.toString();
    }
    if (checkConstructor(RegExp, value)) {
      return value.toString();
    }
    return value;
  };
};

export const optionalRegex = /[?$]$/;
export const isOptionalKey = (key = "") => optionalRegex.test(key);
export const isRequiredKey = (key) => notIsRegExp(key) && !isOptionalKey(key);

export const stringify = (val) => JSON.stringify(val, parser());
export const checkRegExp = (regExp, value) => regExp.test(value);
// export const stringToRegExp = (string) =>isRegExp(string) && new RegExp(eval(string));
export const stringToRegExp = (string) => new RegExp(eval(string));
export const isRegExp = (value) => value && /^\/.+\/$/.test(value);
export const notIsRegExp = (value) => !isRegExp(value);

// export const isError = (e) => e && e.stack && e.message;
// export const isError = (e) => e instanceof Error
