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
    if (!host || !/^[a-zA-Z0-9.-]+(?::\\d+)?$/.test(host)) {
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
      .replace(/\\b\\w/g, (char) => char.toUpperCase());

    const escapeHtml = (value) =>
      String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
      })[char]);

    const safeUrl = escapeHtml(origin + "/@" + encodeURIComponent(username));
    const imageUrl = escapeHtml(origin + "/assets/images/thumbnail.jpg");
    const description = escapeHtml(
      "Undangan Pernikahan Sevan Galang Prasetyo & Lili Nafisa Nestya untuk " +
      guestName + " — 29 November 2026, Purwokerto."
    );

    html = html.replace("<head>", '<head>\\n  <base href="/">');

    const replaceProperty = (property, value) => {
      const tag = '<meta property="' + property + '" content="' + value + '">';
      const pattern = new RegExp(
        '<meta[^>]*property="' + property.replace(/[.*+?^$\u007b\u007d()|[\\]\\\\]/g, "\\\\$&") + '"[^>]*>',
        "i"
      );
      if (pattern.test(html)) html = html.replace(pattern, tag);
      else html = html.replace("</head>", tag + "\\n</head>");
    };

    const replaceName = (name, value) => {
      const tag = '<meta name="' + name + '" content="' + value + '">';
      const pattern = new RegExp('<meta[^>]*name="' + name + '"[^>]*>', "i");
      if (pattern.test(html)) html = html.replace(pattern, tag);
      else html = html.replace("</head>", tag + "\\n</head>");
    };

    replaceProperty("og:type", "website");
    replaceProperty("og:title", "The Wedding of Galang &amp; Lili");
    replaceProperty("og:description", description);
    replaceProperty("og:url", safeUrl);
    replaceProperty("og:image", imageUrl);
    replaceProperty("og:image:secure_url", imageUrl);
    replaceName("twitter:card", "summary_large_image");
    replaceName("twitter:title", "The Wedding of Galang &amp; Lili");
    replaceName("twitter:description", description);
    replaceName("twitter:image", imageUrl);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.setHeader("X-Robots-Tag", "noindex");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Guest preview error:", error);
    return res.status(500).send("Terjadi kesalahan saat menyiapkan preview undangan");
  }
};
