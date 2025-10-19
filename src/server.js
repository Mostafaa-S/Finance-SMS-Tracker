// server.js

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { translateIfArabic } from './utils/translator.js';
import { parseTransaction } from './utils/smsParser.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🗄️ Temporary "database"
let transactions = [];

// 🧠 Handle incoming SMS
app.post('/api/transaction', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log("Message",message)

    // 1️⃣ Translate (if Arabic)
    const translatedText = await translateIfArabic(message);
    console.log("Translated text ",translatedText)

    // const translatedText = "65.00 EGP was deducted from the prepaid card number 0493 By Mobile Payment at Vodafone Top Up APP on 16/10 at 1:46 available 6454.76 for more call 19623"; // <-- Use a direct English message for testing parser
    // console.log("Translated text (direct input for debug)", translatedText); // Changed log

    // 2️⃣ Parse transaction details
    const parsedData = parseTransaction(translatedText);
    console.log("Parsed data ", parsedData)

    // 3️⃣ Add metadata + store in-memory
    parsedData.originalMessage = message;
    parsedData.translatedMessage = translatedText;
    parsedData.timestamp = new Date().toISOString();


    transactions.push(parsedData);

    // 4️⃣ Respond to frontend
    res.json({
      success: true,
      parsedData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🧾 Summary endpoint
app.get('/api/summary', (req, res) => {
  const totalSpent = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalGained = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  res.json({
    totalSpent,
    totalGained,
    count: transactions.length,
    transactions
  });
});

// 🚀 Start server
const PORT = 5000;
process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
