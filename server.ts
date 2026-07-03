import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const app = express();
app.use(express.json());

// --- API Routes ---

// 1. Generate Daily Affirmation
app.post('/api/generate-affirmation', async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Generate a short, powerful daily affirmation. Make it inspiring and uplifting. Do not include quotes or extra text, just the affirmation itself.',
    });
    res.json({ affirmation: response.text });
  } catch (error: any) {
    console.error('Error generating affirmation:', error);
    res.status(500).json({ error: 'Failed to generate affirmation' });
  }
});

// 2. Generate Daily Bible Verse
app.post('/api/generate-verse', async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Provide a random, inspiring Bible verse. Format your response exactly as JSON: {"verse_reference": "Book Chapter:Verse", "verse_text": "The actual verse text...", "explanation": "A short, one sentence explanation of its meaning and how to apply it."}. Do not include markdown blocks, just return the JSON object.',
    });
    let result = response.text || '{}';
    result = result.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(result));
  } catch (error: any) {
    console.error('Error generating verse:', error);
    res.status(500).json({ error: 'Failed to generate verse' });
  }
});

// 3. Grammar Correction
app.post('/api/grammar-check', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Review the following text for grammatical errors, spelling mistakes, and flow. Return the corrected version only. Do not add any conversational filler. Here is the text:\n\n${text}`,
    });
    res.json({ correctedText: response.text });
  } catch (error: any) {
    console.error('Error checking grammar:', error);
    res.status(500).json({ error: 'Failed to check grammar' });
  }
});

// 4. Chat with AI
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    const formattedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    
    const lastMessage = messages[messages.length - 1].content;
    
    const response = await ai.models.generateContent({
       model: 'gemini-3.5-flash',
       contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: lastMessage }]}
       ],
       config: {
         systemInstruction: "You are a warm, empathetic, and inspiring AI companion on a personal journaling and poetry platform called ANJY. Your purpose is to listen, encourage, provide inspiration for poetry and writing, and offer comforting thoughts."
       }
    });
    
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});

// 5. Backup to Email
app.post('/api/backup', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase is not configured' });
    }
    
    if (!resend) {
      return res.status(500).json({ error: 'Resend is not configured. Please add RESEND_API_KEY to environment variables.' });
    }

    console.log(`[Backup System] Preparing backup for website owner: ${email}`);
    
    const [poemsResult, diaryResult, versesResult, affirmationsResult] = await Promise.all([
      supabase.from('poems').select('*'),
      supabase.from('diary_entries').select('*'),
      supabase.from('bible_verses').select('*'),
      supabase.from('affirmations').select('*'),
    ]);

    const formatItems = (items: any[], title: string, contentKey: string) => {
      if (!items || items.length === 0) return '';
      return `<h2>${title}</h2>` + items.map(item => `
        <div style="border-bottom: 1px solid #ccc; padding: 10px 0; margin-bottom: 10px;">
          <h3>${item.title || item.verse_reference || 'Entry'}</h3>
          <p style="white-space: pre-wrap;">${item[contentKey] || ''}</p>
          <small style="color: #666;">${item.created_at || item.display_date || ''}</small>
        </div>
      `).join('');
    };

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #6D28D9;">ANJY Backup</h1>
        <p>Here is the requested backup of your database content.</p>
        <hr />
        ${formatItems(poemsResult.data || [], 'Poems', 'content')}
        ${formatItems(diaryResult.data || [], 'Diary Entries', 'content')}
        ${formatItems(versesResult.data || [], 'Bible Verses', 'verse_text')}
        ${formatItems(affirmationsResult.data || [], 'Affirmations', 'affirmation_text')}
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'ANJY Backup <onboarding@resend.dev>',
      to: email,
      subject: 'Your ANJY Content Backup',
      html: htmlContent
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email: ' + error.message });
    }

    res.json({ success: true, message: 'Backup sent successfully' });
  } catch (error: any) {
    console.error('Error during backup:', error);
    res.status(500).json({ error: 'Failed to process backup' });
  }
});

// --- Server Startup or Export ---

const startServer = async () => {
  const PORT = 3000;
  
  // Only mount static serving & Vite if NOT running as Vercel serverless function
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
};

startServer();

export default app;
