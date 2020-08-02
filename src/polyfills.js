
// globalThis polyfill
if (typeof globalThis === 'undefined') {
  let getGlobal = function () {
    if (typeof self !== 'undefined') { return self; }
    if (typeof window !== 'undefined') { return window; }
    if (typeof global !== 'undefined') { return global; }
    throw new Error('unable to locate global object');
  };
  let globalThis = getGlobal();
  globalThis.globalThis = globalThis
}

// only work in node
// import util from "util";
// const isProxy = util.types.isProxy;

// Proxy.isProxy  intercepts the creation of Proxy
// from: http://jsfiddle.net/Xotic750/ybhs5Lph/
if (typeof Proxy === 'function') {
  if (typeof Proxy.isProxy !== "function") {
    let proxyDescriptor = Object.getOwnPropertyDescriptor(globalThis, "Proxy");
    let $Proxy = proxyDescriptor.value;
    let revocableDescriptor = Object.getOwnPropertyDescriptor(
      $Proxy,
      "revocable"
    );
    let $revocable = revocableDescriptor.value;

    let proxySymbol = Symbol("proxy");

    proxyDescriptor.value = function Proxy(target, handler) {
      target[proxySymbol] = true;
      let proxy = new $Proxy(target, handler);
      return proxy;
    };

    revocableDescriptor.value = function revocable(target, handler) {
      target[proxySymbol] = true;
      let revocableProxy = $revocable(target, handler);
      return revocableProxy;
    };
    Object.defineProperty(
      proxyDescriptor.value,
      "revocable",
      revocableDescriptor
    );

    let isProxyDescriptor = {
      value: function isProxy(obj) {
        return obj[proxySymbol] || false;
      },
    };

    Object.defineProperty(proxyDescriptor.value, "isProxy", isProxyDescriptor);

    Object.defineProperty(globalThis, "Proxy", proxyDescriptor);
  }
} else {
  globalThis.Proxy = {
    isProxy() {
      return false;
    }
  }
}



// Custom AggregateError polyfill
// TODO test it
if (typeof AggregateError === "undefined") {
  class AggregateError extends Error {
    constructor(errors = [], message) {
      super(message);
      this.errors = errors;
      this.name = 'AggregateError';
    }

    push(err){
      this.errors.push(err)
    }

  }

  globalThis.AggregateError = AggregateError;
}

// Array.prototype.flatMap polyfill
if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth) {
    var flattend = [];
    (function flat(array, depth) {
      for (let el of array) {
        if (Array.isArray(el) && depth > 0) {
          flat(el, depth - 1);
        } else {
          flattend.push(el);
        }
      }
    })(this, Math.floor(depth) || 1);
    return flattend;
  };
}
if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function() {
    return Array.prototype.map.apply(this, arguments).flat(1);
  };
}
