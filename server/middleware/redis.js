import { redis } from "../app.js";

export const getCachedData = (key) => async (req, res, next) => {
  let data = await redis.get(key);

  if (data) {
    return res.json({
      products: JSON.parse(data),
    });
  }

  next();
};

getCachedData();

export const rateLimiter =
  ({ limit = 20, timer = 60, key }) =>
  async (req, res, next) => {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const fullKey = `${clientIp}:${key}:request_count`;
    const requestCount = await redis.incr(fullKey);

    console.log("fullKey", fullKey);
    if (requestCount === 1) {
      await redis.expire(fullKey, timer);
    }

    const timeRemaining = await redis.ttl(fullKey);

    if (requestCount > limit) {
      return res
        .status(429)
        .send(
          `Too many requests, please try again later after ${timeRemaining} seconds`
        );
    }
    next();
  };
