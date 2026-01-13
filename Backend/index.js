const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

/* ================= DATABASE ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Error ❌", err);
    process.exit(1);
  });

/* ================= CLOUDINARY ================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce_products",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

/* ================= TEST ================= */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* ================= UPLOAD ================= */
app.post("/upload", upload.single("product"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    return res.json({
      success: true,
      image_url: req.file.path, // Cloudinary URL
    });
  } catch (err) {
    console.error("UPLOAD ERROR 👉", err);
    return res.status(500).json({
      success: false,
      message: "Upload crashed",
      error: err.message,
    });
  }
});

/* ================= PRODUCT MODEL ================= */
const Product = mongoose.model("Product", {
  id: Number,
  name: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
});

/* ================= ADD PRODUCT ================= */
app.post("/addproduct", async (req, res) => {
  try {
    const products = await Product.find({});
    const id = products.length ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: Number(req.body.new_price),
      old_price: Number(req.body.old_price),
    });

    await product.save();
    res.json({ success: true });
  } catch (err) {
    console.error("ADD PRODUCT ERROR 👉", err);
    res.status(500).json({ success: false });
  }
});

/* ================= LIST PRODUCTS ================= */
app.get("/allproducts", async (req, res) => {
  res.json(await Product.find({}));
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR 👉", err);
  res.status(500).json({
    success: false,
    message: "Server error",
    error: err.message,
  });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on ${PORT} 🚀`)
);
