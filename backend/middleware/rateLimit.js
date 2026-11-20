// Simple in-memory rate limiter (no extra package needed).
// Usage: router.use(rateLimit({ windowMs: 60_000, max: 20 }))
// Anushka bhi isko reuse kar sakti hai: interview routes pe rateLimit({ windowMs: 60_000, max: 10 })
function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
  const hits = new Map(); // key -> [timestamps]

  // purane entries saaf karte rehna (memory leak se bachne ke liye)
  const timer = setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [key, times] of hits) {
      const fresh = times.filter((t) => t > cutoff);
      if (fresh.length) hits.set(key, fresh);
      else hits.delete(key);
    }
  }, windowMs);
  timer.unref();

  return (req, res, next) => {
    const key = (req.user && String(req.user._id)) || req.ip || "anon";
    const now = Date.now();
    const times = (hits.get(key) || []).filter((t) => t > now - windowMs);

    if (times.length >= max) {
      const retryAfter = Math.ceil((times[0] + windowMs - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        message: `Too many requests. Try again in ${retryAfter}s.`,
      });
    }

    times.push(now);
    hits.set(key, times);
    next();
  };
}

module.exports = { rateLimit };