const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "username gerekli" });

  try {
    const r = await fetch(`https://twitterwebviewer.com/api/tweets/${encodeURIComponent(username)}`, {
      headers: {
        "accept": "*/*",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "X-Forwarded-For": "159.148.22.179",
        "X-Real-IP": "159.148.22.179"
      },
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: "API status: " + r.status });
    }

    const data = await r.json();
    
    // 🔥 TÜM MÜMKÜN TWEET YOLLARINI YAKALA
    let tweets = [];
    
    // 1. data.tweets
    if (data.tweets) tweets = data.tweets;
    
    // 2. data.data
    else if (data.data?.tweets) tweets = data.data.tweets;
    else if (data.data) tweets = [data.data];
    
    // 3. data.items / data.posts
    else if (data.items) tweets = data.items;
    else if (data.posts) tweets = data.posts;
    
    // 4. Array direkt
    else if (Array.isArray(data)) tweets = data;
    
    // 5. success/data içinden
    else if (data.success && data.data) {
      tweets = data.data.tweets || data.data.items || [data.data];
    }
    
    // Temizle + slice
    tweets = (tweets || [])
      .filter(t => t && (t.text || t.tweet || t.content))
      .map(t => ({
        text: t.text || t.tweet || t.content || t.full_text,
        date: t.created_at || t.date,
        id: t.id,
        likes: t.likes || t.public_metrics?.like_count
      }))
      .slice(0, 10);

    res.json({
      username,
      tweet_count: tweets.length,
      tweets,
      debug: {
        raw_keys: Object.keys(data),
        has_success: !!data.success,
        has_data: !!data.data,
        data_keys: data.data ? Object.keys(data.data) : null
      }
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
