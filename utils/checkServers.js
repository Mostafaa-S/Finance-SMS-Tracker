import axios from "axios";

async function testServer(server) {
  try {
    const res = await axios.post(`${server}/translate`, {
      q: "تم خصم 250 جنيه",
      source: "ar",
      target: "en",
      format: "text",
    });
    console.log(`${server} → ${res.data.translatedText}`);
  } catch (err) {
    console.log(`${server} → failed: ${err.message}`);
  }
}

const servers = [
  "https://translate.argosopentech.com",
  "https://translate.astian.org",
  "https://lt.vern.cc",
  "https://libretranslate.de",
];

for (const s of servers) await testServer(s);