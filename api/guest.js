module.exports = async (req, res) => {
  try {
    const rawUsername = Array.isArray(req.query.username)
      ? req.query.username[0]
      : req.query.username;
    const username = String(rawUsername || "").trim();

    if (!/^[a-zA-Z0-9_.-]{1,60}$/.test(username)) {
      return res.status(400).send("Username tamu tidak valid");
    }

    const host = req.headers.host;
    if (!host || !/^[a-zA-Z0-9.-]+(?::\d+)?$/.test(host)) {
      return res.status(400).send("Host tidak valid");
    }

    const origin = "https://" + host;
    const pageResponse = await fetch(origin + "/index.html");

    if (!pageResponse.ok) {
      return res.status(502).send("Halaman undangan gagal dimuat");
    }

    let html = await pageResponse.text();

    const guestName = username
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const escapeHtml = (value) =>
      String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);

    const safeName = escapeHtml(guestName);
    const safeUrl = escapeHtml(origin + "/@" + encodeURIComponent(username));
    const imageUrl = escapeHtml(origin + "/assets/images/thumbnail.jpg");
    const description = escapeHtml(
      "Undangan Pernikahan Sevan Galang Prasetyo & Lili Nafisa Nestya untuk " +
      guestName + " — 29 November 2026, Purwokerto."
    );

    html = html.replace(/<head([^>]*)>/i, (match) =>
      match + '\n  <base href="/">'
    );

    const replaceMeta = (property, content) => {
      const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(
        '<meta\\s+property=["\\']' + escapedProperty +
        '["\\'][^>]*>',
        "i"
      );
      const tag = '<meta property="' + property + '" content="' + content + '">';
      if (pattern.test(html)) html = html.replace(pattern, tag);
      else html = html.replace(/<\\/head>/i, tag + "\\n</head>");
    };

    replaceMeta("og:type", "website");
    replaceMeta("og:title", "The Wedding of Galang &amp; Lili");
    replaceMeta("og:description", description);
    replaceMeta("og:url", safeUrl);
    replaceMeta("og:image", imageUrl);
    replaceMeta("og:image:secure_url", imageUrl);
    replaceMeta("twitter:card", "summary_large_image");
    replaceMeta("twitter:title", "The Wedding of Galang &amp; Lili");
    replaceMeta("twitter:description", description);
    replaceMeta("twitter:image", imageUrl);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.setHeader("X-Robots-Tag", "noindex");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Guest preview error:", error);
    return res.status(500).send("Terjadi kesalahan saat menyiapkan preview undangan");
  }
};
