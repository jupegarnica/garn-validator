import { collectAllErrors } from "garn-validator";

try {
  console.log(collectAllErrors(Boolean, String, (v) => v < 0)(33));
} catch (error) {
  console.error(error);
}
