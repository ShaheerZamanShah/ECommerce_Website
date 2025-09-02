const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = '/tmp/ecommerce.db';
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT
  )`);

  // Check if products exist, if not, insert sample data
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (!err && row.count === 0) {
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
    }
  });
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.path === '/api/products' && event.httpMethod === 'GET') {
      return new Promise((resolve) => {
        db.all('SELECT * FROM products', (err, rows) => {
          if (err) {
            resolve({ statusCode: 500, headers, body: JSON.stringify({ error: err.message }) });
          } else {
            resolve({ statusCode: 200, headers, body: JSON.stringify(rows) });
          }
        });
      });
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
