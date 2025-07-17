import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";
import * as dotenv from "dotenv"; dotenv.config();

const app = express();
app.use(express.json());           // so Express can read JSON bodies

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

/**
 * POST /api/summarize   { "title": "Alan Turing" }
 * returns              { "summary": "..." }
 */
app.use(express.static("."));  
app.use(express.json());

app.post("/api/summarize", async (req, res) => {
  try {
    const raw = req.body.title ?? "";
    if (!raw) return res.status(400).json({ error: "Missing title" });

    // 1️⃣ Normalise the wiki title (handles pasted URLs too)
    const clean = raw.trim().split("/").pop().replace(/ /g, "_");

    // 2️⃣ Pull article text from Wikipedia
    const url =
      `https://en.wikipedia.org/w/api.php` +
      `?action=query&prop=extracts&explaintext=1&format=json&titles=${clean}`;
    const wiki = await fetch(url, { headers: { "User-Agent": "wiki-summarizer/0.1" }})
                  .then(r => r.json());

    const page = Object.values(wiki.query.pages)[0];
    if (!page?.extract) return res.status(404).json({ error: "Article not found" });

    // 3️⃣ Ask OpenAI to summarise 
    const reply = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "system", content: "Summarise Wikipedia articles in ≤2 concise paragraphs." },
        { role: "user",    content: page.extract.slice(0, 14000) } // stay under token limit
      ]
    });

    res.json({ summary: reply.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5001, () => console.log("✓ Backend ready at http://localhost:5001"));
