import {
  hasErrors,
  isValidOrThrow,
  isValid,
  isValidOrThrowAll,
  isValidOrLog,
  isValidOrLogAll,
  TypeValidationError,
  Integer,
  Numeric,
  SafeNumber
} from "garn-validator";

// isValidOrThrow(Numeric)(NaN);

// isValidOrThrow(SafeNumber)(Number.MIN_SAFE_INTEGER - 10000);

isValidOrThrow(SafeNumber)(Number.MAX_SAFE_INTEGER + 1);
