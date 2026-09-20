const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: String, brand: String, categoryName: String, description: String,
  ingredients: [String], images: [String],
  volume: String, routineStep: String,
  price: { type: Number, required: true },
  stockQuantity: { type: Number, default: 0 },
  targetSkinTypes: [String], targetSkinProblems: [String],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  collectionName: String,
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model("Product", productSchema);