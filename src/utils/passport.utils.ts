import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from 'dotenv';

dotenv.config();


const newGoogleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: "/api/v1/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = {
      name: profile.displayName,
      email: profile.emails?.[0]?.value,
      googleId: profile.id,
      avatar: profile.photos?.[0]?.value,
    };

    return done(null, user);
  }
);

passport.use(newGoogleStrategy);
