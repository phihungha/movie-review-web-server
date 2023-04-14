import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prismaClient } from '../db';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtStrategy = new JwtStrategy(options, async (jwtPayload, done) => {
  const userId = jwtPayload.sub as number;
  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    const error = { errors: [{ message: 'Invalid access token' }] };
    return done(error, false);
  }
  return done(null, user);
});

export default jwtStrategy;
