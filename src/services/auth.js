import crypto, { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import {
  DAY,
  FIFTEEN_MINUTES,
} from '../constants/constants.js';
import { UserCollections } from '../db/models/user.js';
import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/sessions.js';

const createSession = () => {
  const accessToken = crypto
    .randomBytes(30)
    .toString('base64');
  const refreshToken = crypto
    .randomBytes(30)
    .toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(
      Date.now() + FIFTEEN_MINUTES,
    ),
    refreshTokenValidUntil: new Date(
      Date.now() + DAY,
    ),
  };
};

export const registerUser = async (payload) => {
  const user = await UserCollections.findOne({
    email: payload.email,
  });
  if (user) throw createHttpError(409);
  const encryptedPassword = await bcrypt.hash(
    payload.password,
    10,
  );
  return await UserCollections.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
  const user = await UserCollections.findOne({
    email: payload.email,
  });

  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  const isEqual = await bcrypt.compare(
    payload.password,
    user.password,
  );
  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionsCollection.deleteOne({
    userId: user._id,
  });

  const newSession = createSession();

  try {
    return await SessionsCollection.create({
      userId: user._id,
      ...newSession,
    });
  } catch (err) {
    console.error('Session creation error:', err);

    if (err.code === 11000) {
      throw createHttpError(
        409,
        'Token conflict',
      );
    }

    throw createHttpError(
      500,
      'Failed to create session',
    );
  }
};
export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({
    _id: sessionId,
  });
};

export const refreshUsersSession = async ({
  sessionId,
  refreshToken,
}) => {
  const session =
    await SessionsCollection.findOne({
      _id: sessionId,
      refreshToken,
    });

  if (!session) {
    throw createHttpError(
      401,
      'Session not found',
    );
  }

  const isSessionTokenExpired =
    new Date() >
    new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(
      401,
      'Session token expired',
    );
  }

  const newSession = createSession();

  await SessionsCollection.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};
