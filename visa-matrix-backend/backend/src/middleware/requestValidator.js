import { ZodError } from "zod";
import { RequestValidationError } from "../core/errors.js";

const parseWithSchema = (schema, value) => {
  if (!schema) {
    return value;
  }

  return schema.parse(value);
};

export const requestValidator = (schemas = {}) => {
  return (req, _res, next) => {
    try {
      req.body = parseWithSchema(schemas.body, req.body);
      req.query = parseWithSchema(schemas.query, req.query);
      req.params = parseWithSchema(schemas.params, req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new RequestValidationError("Request validation failed.", error.flatten())
        );
      }

      return next(error);
    }
  };
};
