const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Groq API Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful study assistant for college students. Answer questions clearly and concisely in 2-3 sentences.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (response.ok && data.choices?.[0]?.message?.content) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      console.error('Groq API error:', data);
      res.status(500).json({ error: 'Failed to get response from AI' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chatbot backend is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Chatbot server running on http://localhost:${PORT}`);
  console.log(`📡 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});
