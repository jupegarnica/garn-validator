export const AsyncFunction = Object.getPrototypeOf(async function () {})
  .constructor;
export const GeneratorFunction = Object.getPrototypeOf(function* () {})
  .constructor;

const descriptor = (data) => ({
  value: data,
  writable: false,
  enumerable: false,
  configurable: false,
});
export class TypeValidationError extends TypeError {
  constructor(msg, data) {
    super(msg);
    this.name = "TypeValidationError";
    Object.defineProperty(this, "raw", descriptor(data));
  }
}

export class CastError extends AggregateError {
  constructor(errors, msg, data) {
    super(errors, msg);
    this.name = "CastError";
    Object.defineProperty(this, "raw", descriptor(data));
  }
}

export class EnumValidationError extends AggregateError {
  constructor(errors, msg, data) {
    super(errors, msg);
    this.name = "EnumValidationError";
    Object.defineProperty(this, "raw", descriptor(data));
  }
}
export class SchemaValidationError extends AggregateError {
  constructor(errors, msg, data) {
    super(errors, msg);
    this.name = "SchemaValidationError";
    Object.defineProperty(this, "raw", descriptor(data));
  }
}
export class SerieValidationError extends AggregateError {
  constructor(errors, msg, data) {
    super(errors, msg);
    this.name = "SerieValidationError";
    Object.defineProperty(this, "raw", descriptor(data));
  }
}

// TODO FIX WHEN SOME CONSTRUCTORS DO NOT EXIST
export const constructors = new Proxy(
  [
    typeof Proxy !== "undefined" ? Proxy : Object, // intercepted to return the ProxyIntercepted
    typeof GeneratorFunction !== "undefined" ? GeneratorFunction : Object,
    typeof AsyncFunction !== "undefined" ? AsyncFunction : Object,
    typeof Object !== "undefined" ? Object : Object,
    typeof Function !== "undefined" ? Function : Object,
    typeof Array !== "undefined" ? Array : Object,
    typeof Number !== "undefined" ? Number : Object,
    typeof Boolean !== "undefined" ? Boolean : Object,
    typeof String !== "undefined" ? String : Object,
    typeof Symbol !== "undefined" ? Symbol : Object,
    typeof Date !== "undefined" ? Date : Object,
    typeof Promise !== "undefined" ? Promise : Object,
    typeof RegExp !== "undefined" ? RegExp : Object,
    typeof Map !== "undefined" ? Map : Object,
    typeof BigInt !== "undefined" ? BigInt : Object,
    typeof Set !== "undefined" ? Set : Object,
    typeof WeakMap !== "undefined" ? WeakMap : Object,
    typeof WeakSet !== "undefined" ? WeakSet : Object,
    typeof Error !== "undefined" ? Error : Object,
    typeof EvalError !== "undefined" ? EvalError : Object,
    typeof RangeError !== "undefined" ? RangeError : Object,
    typeof ReferenceError !== "undefined" ? ReferenceError : Object,
    typeof SyntaxError !== "undefined" ? SyntaxError : Object,
    typeof TypeError !== "undefined" ? TypeError : Object,
    typeof URIError !== "undefined" ? URIError : Object,
    typeof ArrayBuffer !== "undefined" ? ArrayBuffer : Object,
    typeof Uint8Array !== "undefined" ? Uint8Array : Object,
    typeof Int8Array !== "undefined" ? Int8Array : Object,
    typeof Uint16Array !== "undefined" ? Uint16Array : Object,
    typeof Int16Array !== "undefined" ? Int16Array : Object,
    typeof Uint32Array !== "undefined" ? Uint32Array : Object,
    typeof Int32Array !== "undefined" ? Int32Array : Object,
    typeof Float32Array !== "undefined" ? Float32Array : Object,
    typeof Float64Array !== "undefined" ? Float64Array : Object,
    typeof Uint8ClampedArray !== "undefined" ? Uint8ClampedArray : Object,
    typeof BigUint64Array !== "undefined" ? BigUint64Array : Object,
    typeof BigInt64Array !== "undefined" ? BigInt64Array : Object,
    typeof SharedArrayBuffer !== "undefined" ? SharedArrayBuffer : Object,
    typeof DataView !== "undefined" ? DataView : Object,
    typeof URL !== "undefined" ? URL : Object,
    typeof URLSearchParams !== "undefined" ? URLSearchParams : Object,
    typeof TextEncoder !== "undefined" ? TextEncoder : Object,
  ],
  {
    get(target, key) {
      if (key == 0) {
        //  if the proxy is intercepted it will return ProxyIntercepted
        return Proxy;
        // return typeof __ProxyIntercepted === 'function' ? __ProxyIntercepted : Proxy;
      }
      return target[key];
    },
  }
);
