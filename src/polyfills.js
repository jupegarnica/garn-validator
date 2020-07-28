// AggregateError polyfill
if (typeof AggregateError === "undefined") {
  class AggregateError extends Error {
    constructor(errors, message) {
      super(message);
      this.errors = errors;
    }
  }
  global.AggregateError = AggregateError;
}
