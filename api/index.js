const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "username gerekli" });
  }

  try {
    const r = await fetch(`https://twitterwebviewer.com/api/tweets/${encodeURIComponent(username)}`, {
      headers: {
        "accept": "*/*",
        "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "referer": `https://twitterwebviewer.com/?user=${encodeURIComponent(username)}`,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
        
        // 🔥 IP GİZLEME HEADERLARI
        "X-Forwarded-For": "159.148.22.179, 185.234.218.41",
        "X-Real-IP": "159.148.22.179",
        "X-Client-IP": "159.148.22.179",
        "X-Cluster-Client-IP": "159.148.22.179",
        "CF-Connecting-IP": "159.148.22.179",
        "True-Client-IP": "159.148.22.179",
        "Client-IP": "159.148.22.179",
        "Forwarded": "for=159.148.22.179",
        "X-Originating-IP": "159.148.22.179",
        
        // Rotasyon için rastgele UA
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"'
      },
    });

    console.log(`Status: ${r.status} | Headers: ${JSON.stringify([...r.headers.entries()])}`);

    if (!r.ok) {
      const errorText = await r.text();
      return res.status(r.status).json({ 
        error: "Tweetler alınamadı", 
        status: r.status,
        raw: errorText.substring(0, 500)
      });
    }

    const data = await r.json();
    const tweets = data?.tweets?.slice(0, 5) || [];

    res.json({
      username,
      tweet_count: tweets.length,
      tweets,
      raw_data_keys: Object.keys(data || {}), // Debug için
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Twitter fetch failed", details: e.message });
  }
};
