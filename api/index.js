const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "username gerekli" });
  }

  try {
    const r = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          "x-ig-app-id": "936619743392459",
          accept: "application/json",
        },
      }
    );

    const data = await r.json();

    const u = data?.data?.user;
    if (!u) return res.status(404).json({ error: "profil bulunamadı" });

    res.json({
      username: u.username,
      full_name: u.full_name,
      followers: u.edge_followed_by.count,
      following: u.edge_follow.count,
      posts: u.edge_owner_to_timeline_media.count,
      bio: u.biography,
      profile_pic: u.profile_pic_url_hd,
      is_private: u.is_private,
    });
  } catch (e) {
    res.status(500).json({ error: "instagram fetch failed" });
  }
};
