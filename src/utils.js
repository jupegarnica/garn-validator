import "./polyfills.js";
const isProxy = Proxy.isProxy;


export const AsyncFunction = Object.getPrototypeOf(async function () {})
  .constructor;
export const GeneratorFunction = Object.getPrototypeOf(function* () {})
  .constructor;
export const isNullish = (val) => val === undefined || val === null;

export const checkConstructor = (type, val) =>
  (!isNullish(val) && val.constructor === type) ||
  (Proxy === type && isProxy(val));

export const isClass = (fn) =>
  typeof fn === "function" &&
  /^\bclass(?!\$)\b/.test(fn.toString()) &&
  !isFunctionHacked(fn);

export const isFunction = (fn) =>
  // checkConstructor(Function, fn)
  typeof fn === "function" && !isClass(fn) && !isFunctionHacked(fn);

export const isFunctionHacked = (fn) =>
  typeof fn === "function" &&
  fn.toString.toString() !== "function toString() { [native code] }";

export const isCustomValidator = (fn) =>
  checkConstructor(Function, fn) &&
  !isClass(fn) &&
  (!fn.name || fn.name[0] === fn.name[0].toLowerCase());

export const isInvalidType = (fn) =>
  checkConstructor(AsyncFunction, fn) || checkConstructor(GeneratorFunction, fn)
export function isConstructor(f) {
  if (!f) return false;
  // if (!checkConstructor(Function, f)) return false
  if (isClass(f)) return true;
  if (!f.constructor) return false;
  // Not created with new
  if (f.name === "Symbol") return true;
  if (f.name === "BigInt") return true;

  // needs especial params to be instantiated
  if (f.name === "Promise") return true;
  if (f.name === "DataView") return true;
  if (f.name === "Proxy") return true;
  if (f.name === "URL") return true;
  // detect custom validator (anonymous or its name starts with lowercase)
  if (isCustomValidator(f)) return false;
  // TODO: try to not instantiate
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
  if (isCustomValidator(type)) return "validator";
  if (Array.isArray(type)) return "enum";
  if (checkConstructor(RegExp, type)) return "regex";
  if (isInvalidType( type)) return "invalid";
  // try to avoid isConstructor
  return "constructor";
  // if (isConstructor(type)) return "constructor";
  // throw new Error("Invalid type " + stringify(type));
};


// fails in ArrayBuffer
// export const isPrimitive = (value) => !(value instanceof Object) || (value.constructor === Number || value.constructor === String);
export const isPrimitive = (value) =>
  Object(value) !== value ||
  value.constructor === Number ||
  value.constructor === String;

const addStripMark = (str) => `__strip__${str}__strip__`;
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
      return addStripMark(value.name);
    }
    if (typeof value === "function") {
      return addStripMark(value.toString());
    }
    if (checkConstructor(RegExp, value)) {
      return addStripMark(value.toString());
    }
    return value;
  };
};

export const optionalRegex = /[?$]$/;
export const isOptionalKey = (key = "") => optionalRegex.test(key);
export const isRequiredKey = (key) => notIsRegExp(key) && !isOptionalKey(key);

export const stringify = (val) => {
  let str = JSON.stringify(val, parser());
  return str && str.replace(/("__strip__)|(__strip__")/g, "");
};

export const checkRegExp = (regExp, value) => regExp.test(value);
// export const stringToRegExp = (string) =>isRegExp(string) && new RegExp(eval(string));
export const stringToRegExp = (string) => new RegExp(eval(string));
export const isRegExp = (value) => value && /^\/.+\/$/.test(value);
export const notIsRegExp = (value) => !isRegExp(value);

// export const isError = (e) => e && e.stack && e.message;
// export const isError = (e) => e instanceof Error
