const express = require("express");
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

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
