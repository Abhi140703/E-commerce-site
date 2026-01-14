const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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

/* ================= MULTER ================= */
const upload = multer({ storage: multer.memoryStorage() });

/* ================= TEST ================= */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* ================= IMAGE UPLOAD ================= */
app.post("/upload", upload.single("product"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ecommerce_products" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ success: true, image_url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
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

/* ================= USER MODEL (FIXED) ================= */
const User = mongoose.model("User", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cart: {
    type: Object,
    default: {},
  },
});

/* ================= SIGNUP ================= */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User exists" });
    }

    const user = new User({
      name,
      email,
      password,
      cart: {},
    });

    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ success: false });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ================= CART ================= */
app.post("/getcart", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ cart: {} });
    }

    const user = await User.findOne({ email });
    return res.json({ cart: user?.cart || {} });
  } catch (err) {
    return res.json({ cart: {} });
  }
});


app.post("/addtocart", async (req, res) => {
  try {
    const { email, itemId } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false });

    user.cart[itemId] = (user.cart[itemId] || 0) + 1;
    await user.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/removefromcart", async (req, res) => {
  try {
    const { email, itemId } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false });

    if (user.cart[itemId] > 0) user.cart[itemId] -= 1;
    await user.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
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
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ================= PRODUCTS ================= */
app.get("/allproducts", async (req, res) => {
  res.json(await Product.find({}));
});

app.get("/popularproducts", async (req, res) => {
  res.json(await Product.find({}).limit(8));
});

app.get("/newcollections", async (req, res) => {
  res.json(await Product.find({}).sort({ date: -1 }).limit(8));
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});
