import { ApiError } from "../utils/apiError.js";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new ApiError(400, "VALIDATION_ERROR", "Request validation failed", result.error.flatten()),
      );
    }
    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data;
    }
    next();
  };
}
