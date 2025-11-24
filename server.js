import express from 'express';
import path from 'path';
import { pipeline } from '@xenova/transformers';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(process.cwd(), 'public'))); // الملفات الثابتة

// تحميل النموذج عند بدء السيرفر
let localModel;
(async () => {
  console.log("Loading local model...");
  localModel = await pipeline("text-generation", path.join(process.cwd(), "models", "small-model"));
  console.log("Local model loaded.");
})();

// API endpoint لتوليد النصوص
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!localModel) return res.status(503).json({ error: "Model is still loading." });

  try {
    const output = await localModel(message);
    res.json({ response: output[0].generated_text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
