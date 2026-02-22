import { Strategy as LocalStrategy } from 'passport-local';
import argon2 from 'argon2';
import pool from './db.js';

export const initializePassport = (passport) => {
    passport.use(new LocalStrategy(async (username, password, done) => {
        try {
            const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            const user = result.rows[0];

            if (!user) return done(null, false, { message: 'Invalid User' });
            
            const isMatch = await argon2.verify(user.password_hash, password);
            if (isMatch) return done(null, user);
            else return done(null, false, { message: 'Wrong Password' });
        } catch (err) {
            return done(err);
        }
    }));

    // Save user ID to session
    passport.serializeUser((user, done) => done(null, user.id));

    // Get user from DB using ID in session
    passport.deserializeUser(async (id, done) => {
        try {
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            done(null, result.rows[0]);
        } catch (err) {
            done(err);
        }
    });
};