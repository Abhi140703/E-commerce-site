const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* ================= DATABASE ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Connection Failed ❌", err.message);
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

/* ================= ROUTES ================= */
app.get("/", (req, res) => {
  res.send("E-commerce Backend Running 🚀");
});

/* ===== IMAGE UPLOAD ===== */
app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: true,
    image_url: req.file.path, // ✅ CLOUDINARY URL
  });
});

/* ===== PRODUCT MODEL ===== */
const Product = mongoose.model("Product", {
  id: Number,
  name: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
});

/* ===== ADD PRODUCT ===== */
app.post("/addproduct", async (req, res) => {
  const products = await Product.find({});
  const id = products.length ? products[products.length - 1].id + 1 : 1;

  const product = new Product({ id, ...req.body });
  await product.save();

  res.json({ success: true });
});

/* ===== REMOVE PRODUCT ===== */
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true });
});

/* ===== GET PRODUCTS ===== */
app.get("/allproducts", async (req, res) => {
  res.json(await Product.find({}));
});

app.get("/newcollections", async (req, res) => {
  const products = await Product.find({});
  res.json(products.slice(-8));
});

app.get("/popularproducts", async (req, res) => {
  const products = await Product.find({ category: "Women" });
  res.json(products.slice(0, 4));
});

/* ===== AUTH ===== */
const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
});

app.post("/signup", async (req, res) => {
  const existing = await Users.findOne({ email: req.body.email });
  if (existing) return res.json({ success: false });

  const user = new Users(req.body);
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

app.post("/login", async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });
  if (!user || user.password !== req.body.password)
    return res.json({ success: false });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} 🚀`)
);
