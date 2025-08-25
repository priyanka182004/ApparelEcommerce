const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/E-commerce")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((error) => console.log("MongoDB Connection Failed:", error));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Express App is Running" });
});

// Image upload setup
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb('Error: Images Only!');
  }
});
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: 0, error: "No file uploaded" });
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  });
});

// Schemas
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true }
});

const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: { 
    type: Map,
    of: new mongoose.Schema({
      quantity: { type: Number, default: 0 },
      size: { type: String, default: "" }
    }),
    default: {}
  },
  wishlistData: { type: [Number], default: [] },
  date: { type: Date, default: Date.now() }
});

const Order = mongoose.model("Order", {
  name: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  paymentMethod: String,
  upiDetails: {
    upiId: String,
    payerName: String,
    phoneNumber: String,
  },
  totalAmount: Number,
  status: { type: String, default: "pending" }, // Add this line
  date: { type: Date, default: Date.now }
});


// Add this with your other schemas
const Purchase = mongoose.model("Purchase", {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Reference to Order if needed
  products: [{
    productId: { type: Number, required: true },
    name: { type: String, required: true }, // Product name for easy display
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String } // Product image for display
  }],
  status: { type: String, default: "Order Placed" },
  orderDate: { type: Date, default: Date.now },
  totalAmount: { type: Number, required: true }
});


// JWT middleware
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send({ errors: "No token provided" });
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch {
    return res.status(401).send({ errors: "Invalid token" });
  }
};

// Product Routes
app.post("/addproduct", async (req, res) => {
  try {
    let products = await Product.find({});
    let id = products.length > 0 ? products.slice(-1)[0].id + 1 : 1;
    const product = new Product({ id, ...req.body });
    await product.save();
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.get("/allproducts", async (req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true, name: req.body.name });
});

app.get("/newcollections", async (req, res) => {
  try {
    const newcollections = await Product.find({}).sort({ date: -1 }).limit(8);
    res.json(newcollections);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/popularinwomen", async (req, res) => {
  try {
    const products = await Product.find({ category: "women" });
    res.send(products.slice(0, 4));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Auth Routes
app.post("/signup", async (req, res) => {
  let success = false;
  const existingUser = await Users.findOne({ email: req.body.email });
  if (existingUser) return res.status(400).json({ success, errors: "User already exists" });

  try {
    const salt = await bcrypt.genSalt(10);
    const securedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: securedPassword,
      cartData: {}
    });

    await user.save();
    const token = jwt.sign({ user: { id: user.id } }, "secret_ecom");
    success = true;
    res.json({ success, token });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  let success = false;
  const user = await Users.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ success, errors: "User not found" });

  const passCompare = await bcrypt.compare(req.body.password, user.password);
  if (!passCompare) return res.status(400).json({ success, errors: "Incorrect email or password" });

  const token = jwt.sign({ user: { id: user.id } }, "secret_ecom");
  success = true;
  res.json({ success, token });
});

// Cart Routes
app.post("/addtocart", fetchuser, async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Initialize cartData as Map if it doesn't exist
    if (!user.cartData) {
      user.cartData = new Map();
    }

    // Convert itemId to string as Map keys are always strings
    const itemIdStr = itemId.toString();

    // Update or create cart item with size
    if (!user.cartData.get(itemIdStr)) {
      user.cartData.set(itemIdStr, { quantity: 1, size: size || "" });
    } else {
      const existingItem = user.cartData.get(itemIdStr);
      user.cartData.set(itemIdStr, {
        quantity: existingItem.quantity + 1,
        size: size || existingItem.size
      });
    }

    await user.save();
    res.json({ 
      success: true, 
      cartData: Object.fromEntries(user.cartData) 
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/removefromcart", fetchuser, async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const itemIdStr = itemId.toString();
    if (user.cartData.get(itemIdStr)) {
      const existingItem = user.cartData.get(itemIdStr);
      const newQuantity = Math.max(existingItem.quantity - 1, 0);
      
      if (newQuantity > 0) {
        user.cartData.set(itemIdStr, {
          quantity: newQuantity,
          size: existingItem.size
        });
      } else {
        user.cartData.delete(itemIdStr);
      }

      await user.save();
    }

    res.json({ 
      success: true, 
      cartData: Object.fromEntries(user.cartData) 
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/getcart", fetchuser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Convert Map to plain object for response
    const cartData = user.cartData ? Object.fromEntries(user.cartData) : {};
    res.json({ success: true, cartData });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Wishlist Routes
app.post("/addtowishlist", fetchuser, async (req, res) => {
  try {
    const itemId = Number(req.body.itemId);
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.wishlistData.includes(itemId)) {
      user.wishlistData.push(itemId);
      await user.save();
    }

    res.json({ success: true, wishlist: user.wishlistData });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/removefromwishlist", fetchuser, async (req, res) => {
  try {
    const itemId = Number(req.body.itemId);
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.wishlistData = user.wishlistData.filter(id => id !== itemId);
    await user.save();

    res.json({ success: true, wishlist: user.wishlistData });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/getwishlist", fetchuser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.wishlistData);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users (Admin only)
app.get("/allusers", async (req, res) => {
  try {
    const users = await Users.find({}, { name: 1, email: 1, password: 1, _id: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add this before the deleteuser route
app.post("/createorder", async (req, res) => {
  try {
    console.log("Received order data:", req.body); // Log incoming data
    
    const order = new Order({
      ...req.body,
      // Ensure all required fields are included
      name: req.body.name || '',
      address: req.body.address || '',
      city: req.body.city || '',
      state: req.body.state || '',
      pincode: req.body.pincode || '',
      paymentMethod: req.body.paymentMethod || 'COD',
      totalAmount: req.body.totalAmount || 0,
      date: new Date()
    });

    await order.save();
    console.log("Order saved successfully:", order);
    
    res.json({ 
      success: true, 
      orderId: order._id,
      message: "Order placed successfully"
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to create order" 
    });
  }
});


// Add this route before the server starts listening
app.delete("/deleteuser/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    // First, check if the user exists
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }
    // Delete the user
    await Users.findOneAndDelete({ email });
    
    res.json({ 
      success: true, 
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});


// Create purchase (simplified)
app.post("/createpurchase", fetchuser, async (req, res) => {
  try {
    const { products, totalAmount, orderId } = req.body;
    
    // Add product names and images from the product data
    const populatedProducts = await Promise.all(products.map(async (product) => {
      const productData = await Product.findOne({ id: product.productId });
      return {
        productId: product.productId,
        name: productData?.name || "Unknown Product",
        quantity: product.quantity,
        price: product.price,
        image: productData?.image || ""
      };
    }));

    const purchase = new Purchase({
      userId: req.user.id,
      orderId,
      products: populatedProducts,
      totalAmount,
      status: "Order Placed"
    });

    await purchase.save();
    
    res.json({ 
      success: true, 
      message: "Purchase created successfully",
      purchaseId: purchase._id
    });
  } catch (error) {
    console.error("Purchase creation error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to create purchase" 
    });
  }
});

// Get user purchases (simplified)
app.get("/mypurchases", fetchuser, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user.id })
      .sort({ orderDate: -1 });
    
    console.log('Found purchases:', purchases); // Debug log
    
    res.json({ 
      success: true, 
      purchases 
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch purchases" 
    });
  }
});

// Delete purchase (unchanged)
app.delete("/deletepurchase/:id", fetchuser, async (req, res) => {
  try {
    const purchase = await Purchase.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!purchase) {
      return res.status(404).json({ 
        success: false, 
        error: "Purchase not found or not authorized" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Purchase deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete purchase" 
    });
  }
});

// Admin get all orders
app.get("/admin/orders", fetchuser, async (req, res) => {
  try {
    // Check if user is admin (you should implement proper admin check)
    const orders = await Order.find().sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

// Update order status
app.put("/admin/orders/:id/status", fetchuser, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Update corresponding purchase status if exists
    await Purchase.findOneAndUpdate(
      { orderId: req.params.id },
      { status },
      { new: true }
    );

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, error: "Failed to update order status" });
  }
});


// Delete order
app.delete("/admin/orders/:id", fetchuser, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Delete corresponding purchase if exists
    await Purchase.findOneAndDelete({ orderId: req.params.id });

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, error: "Failed to delete order" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});