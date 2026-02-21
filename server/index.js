import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { generateResearch, refineResearch, createPost } from './services/geminiService.js';
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

app.post('/api/refine', async (req, res) => {
    const { id, feedback } = req.body;
    console.log(`Received refinement request for report ID: ${id} with feedback: ${feedback}`);
    const query = `SELECT raw_report FROM research_reports WHERE id = $1;`;
    try {
        const dbResult = await pool.query(query, [id]);
        if (dbResult.rows.length === 0) {
            return res.status(404).json({ error: "Report not found." });
        }
        const rawContent = dbResult.rows[0].raw_report;
        const refinedContent = await refineResearch(rawContent, feedback);
        const updateQuery = `UPDATE research_reports SET refined_report = $1 WHERE id = $2;`;
        await pool.query(updateQuery, [refinedContent, id]);
        res.json({ refinedReport: refinedContent });
    } catch (error) {
        console.error("Error refining report:", error);
        res.status(500).json({ error: "Failed to refine the report." });
    }
});

app.post('/api/createPost', async (req, res) => {
    const { id } = req.body;
    console.log(`Received create post request for report ID: ${id}`);
    const query = `SELECT refined_report, raw_report FROM research_reports WHERE id = $1;`;
    try {
        const dbResult = await pool.query(query, [id]);
        if (dbResult.rows.length === 0) {
            return res.status(404).json({ error: "Report not found." });
        }
        const refinedContent = dbResult.rows[0].refined_report;
        const rawContent = dbResult.rows[0].raw_report;
        let content = refinedContent || rawContent;
        const postContent = await createPost(content);
        const updateQuery = `UPDATE research_reports SET final_post = $1 WHERE id = $2;`;
        await pool.query(updateQuery, [postContent, id]);
        res.json({ postContent: postContent });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Failed to create the post." });
    }});



app.listen(process.env.PORT || 3001, '0.0.0.0', () => {  console.log(`Server is running on port ${process.env.PORT}`);
});
