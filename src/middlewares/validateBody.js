import createHttpError from 'http-errors';

export const validateBody =
  (schema) => async (req, res, next) => {
    try {
      const cleanBody = {};
      for (const key in req.body) {
        cleanBody[key.trim()] = req.body[key];
      }

      req.body = cleanBody;

      await schema.validateAsync(req.body, {
        abortEarly: false,
      });
      next();
    } catch (err) {
      const error = createHttpError(
        400,
        'Bad request',
        { errors: err.details },
      );
      next(error);
    }
  };
