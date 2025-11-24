import express from 'express';
import bodyParser from 'body-parser';
import pkg from '@xenova/transformers'; // استيراد كامل المكتبة
const { pipeline } = pkg; // استخراج pipeline من default export

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

// تحميل النموذج مباشرة من HuggingFace
let localModel;
(async () => {
  console.log("Loading model from HuggingFace...");
  localModel = await pipeline("text-generation", "Qwen/Qwen2-0.5B");
  console.log("Model loaded successfully!");
})();

// API endpoint
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!localModel) return res.status(503).json({ error: "Model is still loading." });

  try {
    const output = await localModel(message, { max_length: 100 });
    res.json({ response: output[0].generated_text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Model error." });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
