const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const { username, debug = "true" } = req.query; // debug=true ekle

  if (!username) {
    return res.status(400).json({ error: "username gerekli" });
  }

  try {
    console.log(`Fetching: https://twitterwebviewer.com/api/tweets/${username}`);
    
    const r = await fetch(`https://twitterwebviewer.com/api/tweets/${encodeURIComponent(username)}`, {
      headers: {
        "accept": "*/*",
        "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "referer": `https://twitterwebviewer.com/?user=${encodeURIComponent(username)}`,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
      },
    });

    console.log(`Status: ${r.status}`);
    console.log(`Headers:`, Object.fromEntries(r.headers.entries()));

    const rawText = await r.text();
    console.log("Raw response (first 500 chars):", rawText.substring(0, 500));

    if (debug === "true") {
      // Debug modda raw response göster
      return res.json({
        status: r.status,
        statusText: r.statusText,
        headers: Object.fromEntries(r.headers.entries()),
        raw_response: rawText,
        parsed: rawText ? JSON.parse(rawText) : null
      });
    }

    if (!r.ok) {
      return res.status(r.status).json({ error: "Tweetler alınamadı", raw: rawText });
    }

    const data = JSON.parse(rawText);
    const tweets = data?.tweets?.slice(0, 5) || [];

    res.json({
      username,
      tweet_count: tweets.length,
      tweets,
      has_tweets: !!data?.tweets?.length
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ 
      error: "Twitter fetch failed", 
      details: e.message,
      stack: e.stack 
    });
  }
};
