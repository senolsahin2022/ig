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
      },
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: "Tweetler alınamadı" });
    }

    const data = await r.json();

    // Burada dönen veriyi ihtiyacına göre seçebilirsin.
    // Örnek: son 5 tweeti döndürmek
    const tweets = data?.tweets?.slice(0, 5) || [];

    res.json({
      username,
      tweet_count: tweets.length,
      tweets,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Twitter fetch failed" });
  }
};
