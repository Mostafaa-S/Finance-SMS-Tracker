// testNetwork.js
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // You might need to install node-fetch: npm install node-fetch

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Or anon key, doesn't matter for pure network check

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in .env file.");
    process.exit(1);
}

async function testNetwork() {
    console.log(`Testing network connection to Supabase API: ${supabaseUrl}/rest/v1/`);

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'GET',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Network check failed with status: ${response.status} ${response.statusText}`);
            console.error("Response body:", await response.text());
            return;
        }

        console.log("Network connection successful!");
        console.log("Response status:", response.status);
        console.log("Response body (partial):", (await response.json()).message); // Supabase /rest/v1/ usually returns a message
    } catch (err) {
        console.error("Network connection FAILED (exception caught):", err);
    }
}

testNetwork();