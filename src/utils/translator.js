import {translate} from "@vitalets/google-translate-api";

export async function translateIfArabic(text) {
  const arabicRegex = /[\u0600-\u06FF]/;
  if (!arabicRegex.test(text)) {
    console.log("No Arabic text detected, skipping translation.");
    return text;
  }

  console.log("Attempting to translate Arabic text:", text); // <-- ADD THIS
  try {
    const res = await translate(text, { from: "ar", to: "en" });
    console.log("Translation successful:", res.text); // <-- ADD THIS
    return res.text; // translated text
  } catch (err) {
    console.error("Translation failed:", err.message);
    // console.error("Full translation error object:", err); // <-- UNCOMMENT FOR MORE DETAIL
    return text; // Return original text on failure
  }
}

  // console.log("typeof translate =", typeof translate);





// export async function postSMSMessage(text){

//     try{

//     const translatedResp = await fetch("https://libretranslate.com/translate", {
//     method: "POST",
//     body: JSON.stringify({
//       q: text,
//       source: "ar",
//       target: "en",
//       format: "text",
//       alternatives: 3,
//       api_key: ""
//     }),
//     headers: { "Content-Type": "application/json" }
//   });

//     console.log(await translatedResp.json());
    
//     return translatedResp.data?.translatedText || text;

//     }catch (err){
//         console.error("Translation Failed: ",err.message || err);
//         return text;
//     }

// }

// const output = await postSMSMessage("65.00EGP من بطاقة المدفوعة مقدما رقم 0493 By Mobile Payment عند Vodafone Top Up APP يوم 16/10 الساعة 1:46 المتاح 6454.76 للمزيد اتصل ب 19623");
// const output2 = await translateIfArabic("تم خصم 65.00EGP من بطاقة المدفوعة مقدما رقم 0493 By Mobile Payment عند Vodafone Top Up APP يوم 16/10 الساعة 1:46 المتاح 6454.76 للمزيد اتصل ب 19623");

// console.log(output2);
