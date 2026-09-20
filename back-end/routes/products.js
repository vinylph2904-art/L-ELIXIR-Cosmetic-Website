const express = require("express");
const router = express.Router();

const Product = require("../models/product");

// GET tất cả sản phẩm
router.get("/", async (req, res) => {
    try {
        const products = await Product.find({
            isDeleted: false
        });

        res.json(products);
    } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);

        res.status(500).json({
            message: "Lỗi khi lấy danh sách sản phẩm"
        });
    }
});


// GET sản phẩm theo productId
router.get("/:productId", async (req, res) => {
    try {
        const product = await Product.findOne({
            productId: req.params.productId,
            isDeleted: false
        });

        if (!product) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm"
            });
        }

        res.json(product);

    } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);

        res.status(500).json({
            message: "Lỗi khi lấy sản phẩm"
        });
    }
});


module.exports = router;