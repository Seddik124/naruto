/*const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // sert index.html

app.post("/chat", async (req, res) => {
  const user_message = req.body.message;
  if (!user_message) {
    return res.status(400).json({ error: "Message vide" });
  }

  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt: user_message,
      stream: false
    });

    res.json({ response: response.data.response || "Pas de réponse" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log(`Serveur démarré sur le port ${process.env.PORT || 10000}`);
});*/
const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

// Enhanced middleware configuration
app.use(cors({
  origin: '*' // Consider restricting in production
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files with explicit fallback
app.use(express.static(path.join(__dirname, "public"), {
  extensions: ['html'],
  index: 'index.html',
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

// Health check endpoint (required for Render)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Improved chat endpoint with timeout and better error handling
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: "Invalid message format",
        details: "Message must be a non-empty string"
      });
    }

    // IMPORTANT: Replace localhost with your Ollama server URL in production
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";
    
    const response = await axios.post(ollamaUrl, {
      model: "llama3",
      prompt: message,
      stream: false
    }, {
      timeout: 10000 // 10-second timeout
    });

    res.json({ 
      response: response.data?.response || "No response generated",
      model: "llama3"
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: "AI service unavailable",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Fallback route for SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Enhanced server startup
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`• App URL: http://localhost:${PORT}`);
  console.log(`• Health check: http://localhost:${PORT}/health`);
});
