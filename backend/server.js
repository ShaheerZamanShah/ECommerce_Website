const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// SQLite database
const db = new sqlite3.Database('./ecommerce.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Create products table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        // Insert sample products if table is empty
        db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
          if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)");
            stmt.run("MacBook Pro", 1299.99, "Professional laptop with M2 chip", "https://via.placeholder.com/300x200?text=MacBook+Pro");
            stmt.run("iPhone 15", 799.99, "Latest smartphone with advanced camera", "https://via.placeholder.com/300x200?text=iPhone+15");
            stmt.run("AirPods Pro", 249.99, "Noise-cancelling wireless earbuds", "https://via.placeholder.com/300x200?text=AirPods+Pro");
            stmt.run("iPad Air", 599.99, "Lightweight tablet for creativity", "https://via.placeholder.com/300x200?text=iPad+Air");
            stmt.run("Apple Watch", 399.99, "Smart watch with health monitoring", "https://via.placeholder.com/300x200?text=Apple+Watch");
            stmt.run("Samsung Galaxy S24", 899.99, "Flagship Android smartphone", "https://via.placeholder.com/300x200?text=Galaxy+S24");
            stmt.run("Sony WH-1000XM5", 349.99, "Premium wireless headphones", "https://via.placeholder.com/300x200?text=Sony+Headphones");
            stmt.run("Nintendo Switch", 299.99, "Portable gaming console", "https://via.placeholder.com/300x200?text=Nintendo+Switch");
            stmt.run("Dell XPS 13", 999.99, "Ultra-portable Windows laptop", "https://via.placeholder.com/300x200?text=Dell+XPS+13");
            stmt.run("Google Pixel 8", 699.99, "AI-powered Android phone", "https://via.placeholder.com/300x200?text=Pixel+8");
            stmt.run("Surface Pro 9", 1099.99, "2-in-1 tablet and laptop", "https://via.placeholder.com/300x200?text=Surface+Pro");
            stmt.run("Beats Studio3", 199.99, "Wireless over-ear headphones", "https://via.placeholder.com/300x200?text=Beats+Studio");
            stmt.run("Kindle Paperwhite", 139.99, "Waterproof e-reader", "https://via.placeholder.com/300x200?text=Kindle");
            stmt.run("GoPro Hero 12", 449.99, "4K action camera", "https://via.placeholder.com/300x200?text=GoPro+Hero");
            stmt.run("JBL Charge 5", 149.99, "Portable Bluetooth speaker", "https://via.placeholder.com/300x200?text=JBL+Speaker");
            stmt.finalize();
            console.log('Sample products inserted');
          }
        });
      }
    });
  }
});

// Routes
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/cart/add', (req, res) => {
  const { productId } = req.body;
  console.log('Add to cart request received for product:', productId);
  
  if (!req.session.cart) {
    req.session.cart = [];
  }

  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      console.log('Product found:', row);
      const existingItem = req.session.cart.find(item => item.id === productId);
      if (existingItem) {
        existingItem.quantity += 1;
        console.log('Updated existing item quantity:', existingItem);
      } else {
        const newItem = {
          id: row.id,
          name: row.name,
          price: row.price,
          quantity: 1
        };
        req.session.cart.push(newItem);
        console.log('Added new item to cart:', newItem);
      }
      console.log('Current cart:', req.session.cart);
      res.json({ message: 'Product added to cart' });
    } else {
      console.log('Product not found with id:', productId);
      res.status(404).json({ error: 'Product not found' });
    }
  });
});

app.get('/api/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ items: cart, total });
});

app.post('/api/cart/update', (req, res) => {
  const { productId, quantity } = req.body;
  if (!req.session.cart) {
    req.session.cart = [];
  }

  const item = req.session.cart.find(item => item.id === productId);
  if (item) {
    if (quantity > 0) {
      item.quantity = quantity;
    } else {
      req.session.cart = req.session.cart.filter(item => item.id !== productId);
    }
    res.json({ message: 'Cart updated' });
  } else {
    res.status(404).json({ error: 'Item not found in cart' });
  }
});

app.post('/api/cart/remove', (req, res) => {
  const { productId } = req.body;
  if (!req.session.cart) {
    req.session.cart = [];
  }

  req.session.cart = req.session.cart.filter(item => item.id !== productId);
  res.json({ message: 'Item removed from cart' });
});

app.post('/api/checkout', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Simulate checkout
  req.session.cart = [];
  res.json({ message: 'Checkout successful', total });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
