const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
require("dotenv").config();

const fetchUser = require("./middleware/fetchUser");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: true }));
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
const upload = multer({
  storage: multer.memoryStorage(),
});

/* ================= TEST ================= */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* ================= PRODUCT MODEL ================= */
const Product = mongoose.model("Product", {
  name: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
});

/* ================= USER MODEL ================= */
const User = mongoose.model("User", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cart: {
    type: Object,
    default: {},
  },
});

/* ================= IMAGE UPLOAD ================= */
app.post("/upload", upload.single("product"), async (req, res) => {
  try {
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
    res.status(500).json({ success: false });
  }
});

/* ================= SIGNUP ================= */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const data = { user: { id: user.id } };
    const token = jwt.sign(data, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch {
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

    const data = { user: { id: user.id } };
    const token = jwt.sign(data, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* ================= GET CART ================= */
app.post('/getcart',fetchUser,async(req,res)=>{
    console.log("GetCart");
    let userData = await User.findOne({_id:req.user.id});
    res.json(userData.cartData);
})


/* ================= ADD TO CART ================= */
app.post("/addtocart", fetchUser, async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: "Item ID missing" });

    const user = await User.findById(req.user.id);
    user.cart[itemId] = (user.cart[itemId] || 0) + 1;

    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= REMOVE FROM CART ================= */
app.post("/removefromcart", fetchUser, async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.cart[itemId]) return res.json({ success: false });

    user.cart[itemId] -= 1;
    if (user.cart[itemId] <= 0) delete user.cart[itemId];

    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* ================= ADD PRODUCT ================= */
app.post("/addproduct", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* ================= LIST PRODUCTS ================= */
app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

app.get("/popularproducts", async (req, res) => {
  const products = await Product.find({}).limit(8);
  res.json(products);
});

app.get("/newcollections", async (req, res) => {
  const products = await Product.find({})
    .sort({ date: -1 })
    .limit(8);
  res.json(products);
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});
