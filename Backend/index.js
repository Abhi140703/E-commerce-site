const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://splendid-cannoli-c14f9c.netlify.app", // your Netlify frontend
    ],
    credentials: true,
  })
);

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("E-commerce Backend Running 🚀");
});

// ================= IMAGE UPLOAD =================
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });
app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: true,
    image_url: `${process.env.BASE_URL}/images/${req.file.filename}`,
  });
});

// ================= PRODUCT MODEL =================
const Product = mongoose.model("Product", {
  id: Number,
  name: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  available: Boolean,
  date: {
    type: Date,
    default: Date.now,
  },
});

// ================= ADD PRODUCT =================
app.post("/addproduct", async (req, res) => {
  const products = await Product.find({});
  const id = products.length ? products[products.length - 1].id + 1 : 1;

  const product = new Product({
    id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  await product.save();
  res.json({ success: true, product });
});

// ================= ALL PRODUCTS =================
app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// ================= NEW COLLECTIONS =================
app.get("/newcollections", async (req, res) => {
  const products = await Product.find({});
  const newCollections = products.slice(-8);
  res.json(newCollections);
});

// ================= POPULAR PRODUCTS =================
app.get("/popularproducts", async (req, res) => {
  const products = await Product.find({ category: "Women" });
  res.json(products.slice(0, 4));
});

// ================= USER MODEL =================
const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now },
});

// ================= AUTH =================
app.post("/signup", async (req, res) => {
  const existing = await Users.findOne({ email: req.body.email });
  if (existing) {
    return res.status(400).json({ success: false });
  }

  const cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

app.post("/login", async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });
  if (!user || user.password !== req.body.password) {
    return res.json({ success: false });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

// ================= CART =================
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("No token");

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.id;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
};

app.post("/addtocart", fetchUser, async (req, res) => {
  const user = await Users.findById(req.user);
  user.cartData[req.body.itemId] += 1;
  await user.save();
  res.send("Added");
});

app.post("/getcart", fetchUser, async (req, res) => {
  const user = await Users.findById(req.user);
  res.json(user.cartData);
});

// ================= SERVER =================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
