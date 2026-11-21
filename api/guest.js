module.exports = async (req, res) => {
  try {
    const raw = req.query.username || req.query.to || "";
    const username = String(Array.isArray(raw) ? raw[0] : raw).trim();

    const host = "undangan-liligalang.vercel.app";
    const origin = "https://" + host;
    const response = await fetch(origin + "/index.html");
    if (!response.ok) {
      return res.status(502).send("Halaman undangan gagal dimuat");
    }

    let html = await response.text();

    // URL utama tanpa nama tamu tetap menampilkan halaman normal.
    if (!username) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      return res.status(200).send(html);
    }

    if (!/^[a-zA-Z0-9_.-]{1,60}$/.test(username)) {
      return res.status(400).send("Nama tamu tidak valid");
    }

    const guestName = username
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    })[char]);

    const safeDescription = escapeHtml(
      "Undangan Pernikahan Sevan Galang Prasetyo & Lili Nafisa Nestya untuk " +
      guestName + " — 29 November 2026, Purwokerto."
    );
    const safeUrl = escapeHtml(origin + "/?to=" + encodeURIComponent(username));
    const imageUrl = escapeHtml(origin + "/assets/images/thumbnail.jpg");

    if (!html.includes('<base href="/">')) {
      html = html.replace("<head>", '<head>\n  <base href="/">');
    }

    const setMeta = (attribute, key, value) => {
      const pattern = new RegExp(
        '<meta\\s+' + attribute + '="' + key + '"[^>]*>',
        "i"
      );
      const tag = '<meta ' + attribute + '="' + key + '" content="' + value + '">';
      if (pattern.test(html)) html = html.replace(pattern, tag);
      else html = html.replace("</head>", tag + "\n</head>");
    };

    setMeta("property", "og:type", "website");
    setMeta("property", "og:title", "The Wedding of Galang &amp; Lili");
    setMeta("property", "og:description", safeDescription);
    setMeta("property", "og:url", safeUrl);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:image:secure_url", imageUrl);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", "The Wedding of Galang &amp; Lili");
    setMeta("name", "twitter:description", safeDescription);
    setMeta("name", "twitter:image", imageUrl);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Guest preview error:", error);
    return res.status(500).send("Terjadi kesalahan saat menyiapkan preview undangan");
  }
};
