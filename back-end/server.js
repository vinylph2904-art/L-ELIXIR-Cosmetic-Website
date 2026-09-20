require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());


// Product routes
const productRoutes = require("./routes/products");


// Test backend
app.get("/", (req, res) => {
    res.json({
        message: "Backend is running!"
    });
});


// Product API
app.use("/api/products", productRoutes);


// Connect MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected!");

        app.listen(process.env.PORT, () => {
            console.log(
                `Server running at http://localhost:${process.env.PORT}`
            );
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });