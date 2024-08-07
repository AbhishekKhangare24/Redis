import express from "express";
import { getProductDetail, getProducts } from "./api/products.js";
import Redis from "ioredis";
import { getCachedData, rateLimiter } from "./middleware/redis.js";

const app = express();
export const redis = new Redis({
  host: "redis-11936.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 11936,
  password: "mtNERW6Lt3lHRLbrNLHjlrQ46DdMhG8r",
});

redis.on("connect", () => {
  console.log("Redis connected");
});

app.get(
  "/",
  rateLimiter({ limit: 3, timer: 300, key: "home" }),
  async (req, res) => {
    // current IP address  request count
    res.send(`Hello World!`);
  }
);

app.get(
  "/products",
  rateLimiter({ limit: 5, timer: 20, key: "products" }),
  getCachedData("products"),
  async (req, res) => {
    const products = await getProducts();
    await redis.set("products", JSON.stringify(products));
    //   await redis.setex("products", 20, JSON.stringify(products.products));

    res.json({
      products,
    });
  }
);

app.get("/product/:id", async (req, res) => {
  const id = req.params.id;
  const key = `product:${id}`;

  let product = await redis.get(key);

  if (product) {
    return res.json({
      product: JSON.parse(product),
    });
  }

  product = await getProductDetail(id);
  await redis.set(key, JSON.stringify(product));

  res.json({
    product,
  });
});

app.get("/order/:id", async (req, res) => {
  const productId = req.params.id;
  const key = `product:${productId}`;

  // Any mutation to database here
  // Like creating new order in database
  // reducing the product stock to database
  // etc

  await redis.del(key);
  return res.json({
    message: `Order placed successpully, product id: ${productId} is ordered.`,
  });
});

app.listen(3000, () => {
  console.log("Server is running on part 3000");
});
