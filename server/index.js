import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { generateResearch } from './services/geminiService.js';
import pool from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/research', async (req, res) => {
    const { topic } = req.body;
    console.log(`Received research request for topic: ${topic}`);
    try {
        const result = await generateResearch(topic);
        const query = `INSERT INTO research_reports (topic, raw_report) VALUES ($1, $2) RETURNING id;`;
        const values = [topic, result];

        const dbResult = await pool.query(query, values);
        const newId = dbResult.rows[0].id;
        res.json({
            id: newId,
            result: result
        });

    } catch (error) {
        console.error("Database or AI Error:", error);
        res.status(500).json({ error: "Something went wrong on the backend." });
    }
});


app.listen(process.env.PORT, () => {  console.log(`Server is running on port ${process.env.PORT}`);
});
