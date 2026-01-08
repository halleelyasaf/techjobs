import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  picture: string;
  created_date: string;
  updated_date: string;
}

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id: string, done) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

// Configure Google OAuth Strategy
const setupGoogleStrategy = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    return;
  }

  passport.use(new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value || '';
        const name = profile.displayName || '';
        const picture = profile.photos?.[0]?.value || '';

        // Check if user exists
        let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId) as User | undefined;

        if (user) {
          // Update existing user
          const now = new Date().toISOString();
          db.prepare(`
            UPDATE users SET name = ?, picture = ?, email = ?, updated_date = ? WHERE id = ?
          `).run(name, picture, email, now, user.id);
          
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as User;
        } else {
          // Create new user
          const id = uuidv4();
          const now = new Date().toISOString();
          
          db.prepare(`
            INSERT INTO users (id, google_id, email, name, picture, created_date, updated_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(id, googleId, email, name, picture, now, now);
          
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;
        }

        done(null, user);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  ));

  console.log('✅ Google OAuth configured');
};

setupGoogleStrategy();

export default passport;
