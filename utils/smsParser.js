// smsParser.js

export function parseTransaction(smsText) {
  const result = {
    card: null,
    type: null, // debit or credit
    amount: null,
    currency: null,
    vendor: null,
    date: null,
    time: null,
    availableBalance: null, // New field for available balance
  };

  // --- 1. Extract Card Details ---
  // Matches "card number XXXX" or "**** XXXX" or "ending in XXXX"
  const cardMatch = smsText.match(/(?:card\s(?:number|ending\sin)\s?|\*+\s?)(\d{4})/i);
  if (cardMatch) {
    result.card = cardMatch[1];
  } else {
    // Fallback for simple last 3 digits, e.g., "***0493"
    const simpleCardMatch = smsText.match(/\*+(\d{3,4})/); // Adjusted to catch 3 or 4 digits
    if (simpleCardMatch) result.card = simpleCardMatch[1];
  }


  // --- 2. Extract Amount and Currency Together ---
  // This is more reliable as they usually appear next to each other.
  // Regex: (any recognized currency) followed by (a number with optional decimal)
  // OR (a number with optional decimal) followed by (any recognized currency)
  const amountCurrencyRegex = /(EGP|USD|EUR|SAR|AED|OMR|KWD|BHD)\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(EGP|USD|EUR|SAR|AED|OMR|KWD|BHD)/i;
  const amountCurrencyMatch = smsText.match(amountCurrencyRegex);

  if (amountCurrencyMatch) {
    // If currency is first (Group 1, Amount Group 2)
    if (amountCurrencyMatch[1] && amountCurrencyMatch[2]) {
      result.currency = amountCurrencyMatch[1].toUpperCase();
      result.amount = parseFloat(amountCurrencyMatch[2]);
    }
    // If amount is first (Group 3, Currency Group 4)
    else if (amountCurrencyMatch[3] && amountCurrencyMatch[4]) {
      result.amount = parseFloat(amountCurrencyMatch[3]);
      result.currency = amountCurrencyMatch[4].toUpperCase();
    }
  }


  // --- 3. Determine Transaction Type (Debit/Credit) ---
  // More keywords for robustness
  if (/deducted|spent|charged|withdrawn|debit|purchase/i.test(smsText)) {
    result.type = "debit";
  } else if (/received|credited|deposit|added|transfer in/i.test(smsText)) {
    result.type = "credit";
  }


  // --- 4. Extract Vendor/Merchant ---
  // Looking for common prepositions like 'at', 'from', 'for' followed by a name.
  // This is often the trickiest part as vendor names are free-form.
  const vendorRegex = /(?:from*number)*(?:[0-9]+)\s+(?:at|from|to|for|by)\s+([A-Za-z0-9\s.&'-]+?)(?:\s+(?:on|date|time|ref|transaction|available|balance|$))/i;
  const vendorMatch = smsText.match(vendorRegex);
  if (vendorMatch) {
    // Clean up extra spaces or common trailing words
    let vendorName = vendorMatch[1].trim();
    vendorName = vendorName.replace(/\s+(?:on|date|time|ref|transaction|available|balance)$/i, '');
    result.vendor = vendorName;
  }


  // --- 5. Extract Date and Time ---
  // Date: DD/MM, DD/MM/YY, DD-MM, DD-MM-YYYY, etc.
  // Time: HH:MM, HH:MM:SS
  const dateRegex = /(\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?)/; // Catches DD/MM, DD/MM/YY, DD-MM, DD-MM-YYYY
  const timeRegex = /(\d{1,2}:\d{2}(?::\d{2})?)/; // Catches HH:MM or HH:MM:SS

  const fullDateMatch = smsText.match(/on\s+(\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?)\s+at\s+(\d{1,2}:\d{2}(?::\d{2})?)/i);
  if (fullDateMatch) {
    result.date = fullDateMatch[1];
    result.time = fullDateMatch[2];
  } else {
    const dateMatch = smsText.match(dateRegex);
    const timeMatch = smsText.match(timeRegex);
    if (dateMatch) result.date = dateMatch[1];
    if (timeMatch) result.time = timeMatch[1];
  }


  // --- 6. Extract Available Balance ---
  // Look for keywords like "Available", "Balance", "Remaining" followed by amount and currency
  const balanceRegex = /(?:available|balance|remaining):?\s*(\d+(?:\.\d{1,2})?)\s*(EGP|USD|EUR|SAR|AED|OMR|KWD|BHD)?/i;
  const balanceMatch = smsText.match(balanceRegex);
  if (balanceMatch) {
    result.availableBalance = parseFloat(balanceMatch[1]);
    // Optionally, you could also store the balance currency if different from transaction currency
    // For simplicity, we'll assume it's the same or we only care about the amount here.
  }

  return result;
}

// Example usage
// const testSMS = "65.00 EGP was deducted from the prepaid card number 0493 By Mobile Payment at Vodafone Top Up APP on 16/10 at 1:46 available 6454.76 for more call 19623";
// console.log(parseTransaction(testSMS));

// const testSMS2 = "EGP 150.00 charged on 25-11-2023 at MyCoffee Shop. Balance: 1200.00 EGP.";
// console.log(parseTransaction(testSMS2));