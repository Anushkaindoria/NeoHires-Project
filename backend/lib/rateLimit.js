const hits = new Map();

function rateLimit({ windowMs, max }) {
  return (req, res, next) => {
    const key = String(req.user?._id || req.ip);
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      return res.status(429).json({ message: "Too many requests. Please wait a minute." });
    }

    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

module.exports = rateLimit;