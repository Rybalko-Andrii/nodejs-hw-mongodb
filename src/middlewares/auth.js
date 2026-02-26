import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/sessions.js';
import { UserCollections } from '../db/models/user.js';

export const auth = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    return next(
      createHttpError(
        401,
        'Authorization header is missing',
      ),
    );
  }
  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return next(
      createHttpError(
        401,
        'Invalid authorization format.',
      ),
    );
  }
  const session =
    await SessionsCollection.findOne({
      accessToken: token,
    });
  if (!session) {
    return next(
      createHttpError(
        401,
        'Invalid or expired token',
      ),
    );
  }
  const isAccessTokenExpired =
    new Date() >
    new Date(session.accessTokenValidUntil);
  if (isAccessTokenExpired) {
    return next(
      createHttpError(
        401,
        'Access token expired',
      ),
    );
  }
  const user = await UserCollections.findById(
    session.userId,
  );
  if (!user) {
    return next(
      createHttpError(
        401,
        'User not found for provided session',
      ),
    );
  }
  req.user = user;
  next();
};
