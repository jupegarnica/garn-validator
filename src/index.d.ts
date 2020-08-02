export const AsyncFunction: Function;
export const GeneratorFunction: Function;

export declare class AggregateError {
  constructor(errors: any[], message: string);
  name: string;
  errors: any[];
  message: string;
  stack: string;
}
export declare class EnumValidationError extends AggregateError {
}
export declare class SchemaValidationError extends AggregateError {
}

export declare class SeriesValidationError extends AggregateError {
}

export function arrayOf(type: any): Function;
export function objectOf(type: any): Function;

export function isValid(type: any): (value: any) => boolean;
export function isValidOrLog(type: any): (value: any) => boolean;
export function isValidOrLogAllErrors(type: any): (value: any) => boolean;

export function hasErrors(type: any): (value: any) => null | any[];

export function isValidOrThrowAllErrors(
  type: any
): (value: any) => true | never;

export function isValidOrThrow(
  type: any
): (value: any) => true | never;

export default isValidOrThrow;
