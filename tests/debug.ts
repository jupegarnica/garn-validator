
import * as garnValidator from "https://deno.land/x/garn_validator/src/index.js";
import * as ValidatorTypes from "https://deno.land/x/garn_validator/src/index.d.ts";
garnValidator as typeof ValidatorTypes;

const { isValidOrThrow } = garnValidator;


isValidOrThrow(Number )(null)
