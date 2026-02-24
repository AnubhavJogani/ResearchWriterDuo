import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { generateResearch, refineResearch, createPost } from './services/geminiService.js';
import pool from './db.js';
import passport from 'passport';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import argon2 from 'argon2';
import { initializePassport } from './passport-config.js';

const app = express();
const PostgresStore = pgSession(session);
app.use(cors({
    origin: ['https://research-writer-duo.vercel.app', 'https://research-writer-duo.vercel.app/', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
    store: new PostgresStore({ pool: pool }),
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    }
}))

initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

const checkAccess = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    if (req.session && req.session.guestId) {
        return next();
    }

    res.status(401).json({ error: "Unauthorized. Please log in or continue as guest." });
};

app.set('trust proxy', 1);

app.post('/api/guest-init', (req, res) => {
    if (!req.session.guestId) {
        req.session.guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
    req.session.cookie.maxAge = 24 * 60 * 60 * 1000;

    req.session.save((err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, guestId: req.session.guestId });
    });
});

app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json({ error: "Internal server error." });

        if (!user) {
            return res.status(401).json({ error: info.message || "Invalid credentials." });
        }

        req.logIn(user, (err) => {
            if (err) return next(err);

            req.session.save((err) => {
                if (err) return next(err);
                return res.json({ success: true, user: { id: user.id, username: user.username } });
            });
        });
    })(req, res, next);
});


app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const chekUserQuery = `SELECT id FROM users WHERE username = $1;`;
        const checkResult = await pool.query(chekUserQuery, [username]);
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: "Username already exists." });
        }
        const passwordHash = await argon2.hash(password);
        const insertQuery = `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id;`;
        const dbResult = await pool.query(insertQuery, [username, passwordHash]);
        res.json({ success: true, userId: dbResult.rows[0].id });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal server error." });
    };
});

app.post('/api/logout', (req, res) => { req.logout(() => res.json({ success: true })); });

app.get('/api/history', checkAccess, async (req, res) => {
    const userId = req.user ? req.user.id : null;
    const guestId = req.session.guestId || null;
    const query = `SELECT id, topic, raw_report, refined_report, final_post, steps FROM research_reports 
                   WHERE (user_id = $1) OR (guest_id = $2) 
                   ORDER BY created_at DESC;`;
    try {
        const dbResult = await pool.query(query, [userId, guestId]);
        res.json({ history: dbResult.rows });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: "Failed to fetch history." });
    };

});

app.post('/api/research', checkAccess, async (req, res) => {
    const { topic } = req.body;
    console.log(`Received research request for topic: ${topic}`);
    try {
        const result = await generateResearch(topic);
        const query = `INSERT INTO research_reports (topic, raw_report, user_id, guest_id) VALUES ($1, $2, $3, $4) RETURNING id;`;
        const values = [topic, result, req.user ? req.user.id : null, req.session.guestId || null];

        const dbResult = await pool.query(query, values);
        res.json({
            raw_report: result,
            id: dbResult.rows[0].id,
            steps: 1
        });

    } catch (error) {
        console.error("Database or AI Error:", error);
        res.status(500).json({ error: error.message || "Something went wrong while generating research." });
    }
});

app.post('/api/refine', checkAccess,  async (req, res) => {
    const { feedback, id } = req.body;
    const query = `SELECT raw_report, refined_report, steps FROM research_reports WHERE id = $1;`;
    try {
        const dbResult = await pool.query(query, [id]);
        if (dbResult.rows.length === 0) {
            return res.status(404).json({ error: "Report not found." });
        }
        const rawContent = dbResult.rows[0].refined_report || dbResult.rows[0].raw_report;
        const steps = dbResult.rows[0].steps > 2 ? dbResult.rows[0].steps : 2;
        const refinedContent = await refineResearch(rawContent, feedback);
        const updateQuery = `UPDATE research_reports SET refined_report = $1, steps = $2 WHERE id = $3;`;
        await pool.query(updateQuery, [refinedContent, steps, id]);
        res.json({ refined_report: refinedContent, steps: steps });
    } catch (error) {
        res.status(500).json({ error: error.message || "Something went wrong while refining the report." });
    }
});

app.post('/api/createPost', checkAccess, async (req, res) => {
    const { id , requirements } = req.body;
    const query = `SELECT refined_report, raw_report FROM research_reports WHERE id = $1;`;
    try {
        const dbResult = await pool.query(query, [id]);
        if (dbResult.rows.length === 0) {
            return res.status(404).json({ error: "Report not found." });
        }
        const refinedContent = dbResult.rows[0].refined_report;
        const rawContent = dbResult.rows[0].raw_report;
        let content = refinedContent || rawContent;
        const postContent = await createPost(content, requirements);
        const updateQuery = `UPDATE research_reports SET final_post = $1, steps = $2 WHERE id = $3;`;
        await pool.query(updateQuery, [postContent, 3, id]);
        res.json({ final_post: postContent, steps: 3 });
    } catch (error) {
        res.status(500).json({ error: error.message || "Something went wrong while creating the post." });
    }});



const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
