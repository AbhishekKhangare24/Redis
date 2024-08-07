import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/products", (req, res) => {

    const productsPromise
  res.json({
    products: {
      id: 1,
      name: "Product 1",
      price: 100,
    },
  });
});

app.listen(3000, () => {
  console.log("Server is running on part 3000");
});
