  // server.js

  import express from 'express';
  import cors from 'cors';
  import bodyParser from 'body-parser';
  import dotenv from 'dotenv';
  import { createClient } from '@supabase/supabase-js';

  import { translateIfArabic } from './utils/translator.js';
  import { parseTransaction } from './utils/smsParser.js';

  dotenv.config();

  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Using service_role key for server-side

  if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials. Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file.");
      process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log("Supabase client initialized.");


  // 🧠 Handle incoming SMS and store in Supabase
  app.post('/api/transaction', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      console.log("Message received:", message);

      // 1️⃣ Translate (if Arabic)
      const translatedText = await translateIfArabic(message);
      console.log("Translated text:", translatedText);

      // 2️⃣ Parse transaction details
      const parsedData = parseTransaction(translatedText);
      console.log("Parsed data:", parsedData);

      // 3️⃣ Prepare data for Supabase insertion
      const transactionToInsert = {
          // user_id: null, // Still commented out for now
          card: parsedData.card,
          type: parsedData.type,
          amount: parsedData.amount,
          currency: parsedData.currency,
          vendor: parsedData.vendor,
          transaction_date: parsedData.date,
          transaction_time: parsedData.time,
          available_balance: parsedData.availableBalance,
          original_message: message,
          translated_message: translatedText
      };

      console.log("Data to insert into Supabase:", JSON.stringify(transactionToInsert, null, 2)); // <-- ADD THIS LINE

      // 4️⃣ Insert into Supabase
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionToInsert])
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        console.error("Full Supabase error object:", error); // <-- ADD THIS FOR MORE DETAIL
        return res.status(500).json({ error: 'Failed to save transaction to database', details: error.message });
      }

      console.log("Transaction successfully saved to Supabase:", data);

      // 5️⃣ Respond to frontend with the saved data
      res.status(201).json({ // 201 Created status
        success: true,
        message: "Transaction saved successfully",
        transaction: data[0], // Supabase returns an array, so take the first item
        data: data
      });

    } catch (error) {
      console.error("API /api/transaction error:", error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });

  // 🧾 Summary endpoint - Fetch data from Supabase
  app.get('/api/summary', async (req, res) => {
    try {
      // 1️⃣ Fetch all transactions from Supabase
      // For now, no RLS policies are blocking this with the service_role key
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*') // Select all columns
        .order('created_at', { ascending: false }); // Order by newest first

      if (error) {
        console.error("Supabase fetch error:", error);
        return res.status(500).json({ error: 'Failed to retrieve transactions', details: error.message });
      }

      // 2️⃣ Perform summary calculations (same logic as before)
      const totalSpent = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0); // Use parseFloat for amount from DB

      const totalGained = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0); // Use parseFloat for amount from DB

      res.json({
        totalSpent,
        totalGained,
        count: transactions.length,
        transactions // Send all fetched transactions for detailed view
      });

    } catch (error) {
      console.error("API /api/summary error:", error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });

  // 🚀 Start server
  const PORT = 5000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));