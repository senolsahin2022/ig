// node-fetch satırını silin (Node 18+ için gereksizdir)

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "username gerekli" });
  }

  try {
    // Vercel'in kendi fetch'ini kullanıyoruz
    const r = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      {
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "x-ig-app-id": "936619743392459",
        },
      }
    );

    if (!r.ok) {
       return res.status(r.status).json({ error: "Instagram API hatası" });
    }

    const data = await r.json();
    const u = data?.data?.user;

    if (!u) {
      return res.status(404).json({ error: "profil bulunamadı" });
    }

    return res.json({
      username: u.username,
      full_name: u.full_name,
      followers: u.edge_followed_by?.count,
      following: u.edge_follow?.count,
      posts: u.edge_owner_to_timeline_media?.count,
      bio: u.biography,
      profile_pic: u.profile_pic_url_hd,
      is_private: u.is_private,
    });
  } catch (e) {
    return res.status(500).json({ error: "Sunucu hatası: " + e.message });
  }
}
