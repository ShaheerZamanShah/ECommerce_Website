const products = [
  {id: 1, name: "MacBook Pro", price: 1299.99, description: "Professional laptop with M2 chip", image: "https://via.placeholder.com/300x200?text=MacBook+Pro"},
  {id: 2, name: "iPhone 15", price: 799.99, description: "Latest smartphone with advanced camera", image: "https://via.placeholder.com/300x200?text=iPhone+15"},
  {id: 3, name: "AirPods Pro", price: 249.99, description: "Noise-cancelling wireless earbuds", image: "https://via.placeholder.com/300x200?text=AirPods+Pro"},
  {id: 4, name: "iPad Air", price: 599.99, description: "Lightweight tablet for creativity", image: "https://via.placeholder.com/300x200?text=iPad+Air"},
  {id: 5, name: "Apple Watch", price: 399.99, description: "Smart watch with health monitoring", image: "https://via.placeholder.com/300x200?text=Apple+Watch"},
  {id: 6, name: "Samsung Galaxy S24", price: 899.99, description: "Flagship Android smartphone", image: "https://via.placeholder.com/300x200?text=Galaxy+S24"},
  {id: 7, name: "Sony WH-1000XM5", price: 349.99, description: "Premium wireless headphones", image: "https://via.placeholder.com/300x200?text=Sony+Headphones"},
  {id: 8, name: "Nintendo Switch", price: 299.99, description: "Portable gaming console", image: "https://via.placeholder.com/300x200?text=Nintendo+Switch"},
  {id: 9, name: "Dell XPS 13", price: 999.99, description: "Ultra-portable Windows laptop", image: "https://via.placeholder.com/300x200?text=Dell+XPS+13"},
  {id: 10, name: "Google Pixel 8", price: 699.99, description: "AI-powered Android phone", image: "https://via.placeholder.com/300x200?text=Pixel+8"},
  {id: 11, name: "Surface Pro 9", price: 1099.99, description: "2-in-1 tablet and laptop", image: "https://via.placeholder.com/300x200?text=Surface+Pro"},
  {id: 12, name: "Beats Studio3", price: 199.99, description: "Wireless over-ear headphones", image: "https://via.placeholder.com/300x200?text=Beats+Studio"},
  {id: 13, name: "Kindle Paperwhite", price: 139.99, description: "Waterproof e-reader", image: "https://via.placeholder.com/300x200?text=Kindle"},
  {id: 14, name: "GoPro Hero 12", price: 449.99, description: "4K action camera", image: "https://via.placeholder.com/300x200?text=GoPro+Hero"},
  {id: 15, name: "JBL Charge 5", price: 149.99, description: "Portable Bluetooth speaker", image: "https://via.placeholder.com/300x200?text=JBL+Speaker"}
];

// In-memory cart storage (for demo purposes)
let carts = {};

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

  const path = event.path.replace('/.netlify/functions/api', '');
  const sessionId = event.headers['x-session-id'] || 'default';

  try {
    // Get products
    if (path === '/api/products' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(products)
      };
    }

    // Add to cart
    if (path === '/api/cart/add' && event.httpMethod === 'POST') {
      const { productId } = JSON.parse(event.body);
      const product = products.find(p => p.id === parseInt(productId));
      
      if (!product) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Product not found' })
        };
      }

      if (!carts[sessionId]) {
        carts[sessionId] = [];
      }

      const existingItem = carts[sessionId].find(item => item.id === parseInt(productId));
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        carts[sessionId].push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        });
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Product added to cart' })
      };
    }

    // Get cart
    if (path === '/api/cart' && event.httpMethod === 'GET') {
      const cart = carts[sessionId] || [];
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ items: cart, total })
      };
    }

    // Update cart
    if (path === '/api/cart/update' && event.httpMethod === 'POST') {
      const { productId, quantity } = JSON.parse(event.body);
      
      if (!carts[sessionId]) {
        carts[sessionId] = [];
      }

      const item = carts[sessionId].find(item => item.id === parseInt(productId));
      if (item) {
        if (quantity > 0) {
          item.quantity = quantity;
        } else {
          carts[sessionId] = carts[sessionId].filter(item => item.id !== parseInt(productId));
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Cart updated' })
      };
    }

    // Remove from cart
    if (path === '/api/cart/remove' && event.httpMethod === 'POST') {
      const { productId } = JSON.parse(event.body);
      
      if (carts[sessionId]) {
        carts[sessionId] = carts[sessionId].filter(item => item.id !== parseInt(productId));
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Item removed from cart' })
      };
    }

    // Checkout
    if (path === '/api/checkout' && event.httpMethod === 'POST') {
      const cart = carts[sessionId] || [];
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      // Clear cart
      carts[sessionId] = [];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Checkout successful', total })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
