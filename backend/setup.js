const mysql = require('mysql2');

// Create connection without database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Create database
connection.query('CREATE DATABASE IF NOT EXISTS ecommerce', (err) => {
  if (err) {
    console.error('Error creating database:', err);
    return;
  }
  console.log('Database created successfully');

  // Use the database
  connection.query('USE ecommerce', (err) => {
    if (err) {
      console.error('Error using database:', err);
      return;
    }

    // Create products table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image VARCHAR(255)
      )
    `;

    connection.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        return;
      }
      console.log('Table created successfully');

      // Insert sample products
      const insertProductsQuery = `
        INSERT INTO products (name, price, description, image) VALUES
        ('Laptop', 999.99, 'High-performance laptop', 'laptop.jpg'),
        ('Phone', 599.99, 'Smartphone with latest features', 'phone.jpg'),
        ('Headphones', 199.99, 'Noise-cancelling headphones', 'headphones.jpg')
      `;

      connection.query(insertProductsQuery, (err) => {
        if (err) {
          console.error('Error inserting products:', err);
          return;
        }
        console.log('Sample products inserted successfully');
        connection.end();
      });
    });
  });
});
