// testSupabaseInsert.js
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// testSupabaseInsert.js
// ... (imports)

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // COMMENT OUT THIS LINE
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // <-- NEW LINE

if (!supabaseUrl || !supabaseAnonKey) { // <-- CHANGE THIS CHECK
    console.error("Missing Supabase credentials in .env file.");
    process.exit(1);
}

// const supabase = createClient(supabaseUrl, supabaseServiceKey); // COMMENT OUT THIS LINE
const supabase = createClient(supabaseUrl, supabaseAnonKey); // <-- NEW LINE (using anon key)

// ... (rest of the testInsert function remains the same)

async function testInsert() {
    console.log("Attempting a direct insert into Supabase...");

    const testTransaction = {
        card: '0000',
        type: 'test',
        amount: 10.50,
        currency: 'USD',
        vendor: 'Test Vendor',
        transaction_date: '2023-01-01', // Using YYYY-MM-DD for date
        transaction_time: '12:00:00',   // Using HH:MM:SS for time
        available_balance: 1000.00,
        original_message: 'This is a test original message.',
        translated_message: 'This is a test translated message.'
    };

    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert([testTransaction])
            .select();

        if (error) {
            console.error("Supabase insert FAILED:", error);
            console.error("Full error object:", error); // Log full error for more details
            return;
        }

        console.log("Supabase insert SUCCESS! Data:", data);
    } catch (err) {
        console.error("Unexpected error during Supabase insert test:", err);
    }
}

testInsert();