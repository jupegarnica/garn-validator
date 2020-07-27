export const isType = (type) => (val) =>
  ![undefined, null].includes(val) && val.constructor === type;

export const isClass = fn => typeof fn === 'function' &&  /^\s*class\b/.test(fn.toString()) && !isFunctionHacked(fn);

export const isFunction = fn => typeof fn === 'function' && !isFunctionHacked(fn) && !isClass(fn);

export const isFunctionHacked = fn =>  typeof fn === 'function'  && fn.toString.toString() !== 'function toString() { [native code] }'

export const isCustomValidator = (f) => f && typeof f === "function" && !isClass(f) && (!f.name || f.name[0] === f.name[0].toLowerCase());

export function isConstructor(f) {
  if(isClass(f)) return true;
  // symbols are not created with new
  if (f && f.name === "Symbol") return true;
  if (f && f.name === "Promise") return true;
  // detect is a normal function (anonymous or its name starts with lowercase)
  if (isCustomValidator(f)) return false;
  try {
    new f();
    return true;
  } catch (err) {
    return false;
  }
}


export const isInstanceOf = (type) => (val) => val instanceof type;
export const isPrimitive = (value) => !isInstanceOf(Object)(value)
// export const isPrimitive = (value) => !(value instanceof Object);
// export const isPrimitive = value => Object(value) !== value;


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
    if (isInstanceOf(RegExp)(value) ) {
      return value.toString();
    }
    return value;
  };
};

export const optionalRegex = /[?$]$/
export const isOptionalKey = (key = "") => optionalRegex.test(key);
export const isRequiredKey = (key) => notIsRegExp(key) && !isOptionalKey(key);



export const stringify = (val) => JSON.stringify(val, parser());
export const checkRegExp = (regExp, value) => regExp.test(value);
export const stringToRegExp = (string) => new RegExp(eval(string));
export const isRegExp = (value) => value && /^\/.+\/$/.test(value);
export const notIsRegExp = (value) => !isRegExp(value);

// export const isError = (e) => e && e.stack && e.message;
// export const isError = (e) => e instanceof Error
