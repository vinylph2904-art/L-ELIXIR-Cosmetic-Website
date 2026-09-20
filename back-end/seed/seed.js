require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/product");

const products = require("./product.json");

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected!");

    await Product.deleteMany({});

    const result = await Product.insertMany(products);

    console.log(`Đã nạp ${result.length} sản phẩm vào MongoDB.`);

    await mongoose.connection.close();

    console.log("Đã đóng kết nối MongoDB.");
  } catch (error) {
    console.error("Seed thất bại:", error);
    process.exit(1);
  }
};

seedProducts();