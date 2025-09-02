import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentForm from './PaymentForm';
import config from './config';
import './App.css';

// Configure axios defaults
axios.defaults.withCredentials = true;
const API_URL = config.API_URL;

// Generate session ID for cart persistence
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Set up axios interceptor to include session ID
axios.interceptors.request.use((config) => {
  config.headers['x-session-id'] = getSessionId();
  return config;
});

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [view, setView] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load products');
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cart`);
      setCart(response.data.items);
      setCartTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId) => {
    setAddingToCart(productId);
    console.log('Adding product to cart:', productId);
    try {
      const response = await axios.post(`${API_URL}/api/cart/add`, { productId });
      console.log('Add to cart response:', response.data);
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart');
    }
    setAddingToCart(null);
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.post(`${API_URL}/api/cart/update`, { productId, quantity });
      fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.post(`${API_URL}/api/cart/remove`, { productId });
      fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const checkout = async () => {
    setShowPayment(true);
  };

  const handlePaymentComplete = async (paymentResult) => {
    if (paymentResult.success) {
      try {
        await axios.post(`${API_URL}/api/checkout`);
        setCart([]);
        setCartTotal(0);
        setShowPayment(false);
        setView('products');
        alert(`Payment successful! Transaction ID: ${paymentResult.transactionId}`);
      } catch (error) {
        console.error('Error during checkout:', error);
      }
    }
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <div className="App">
      <header className="header">
        <h1 className="title">Modern E-Commerce</h1>
        <nav className="nav">
          <button className="nav-btn" onClick={() => setView('products')}>🏠 Products</button>
          <button className="nav-btn" onClick={() => setView('cart')}>🛒 Cart ({cart.length})</button>
        </nav>
      </header>
      <main className="main">
        {view === 'products' && (
          <div className="products-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            {loading && <div className="loading">Loading products...</div>}
            {error && <div className="error">{error}</div>}
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <img src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'} alt={product.name} className="product-image" />
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">${product.price}</p>
                  <p className="product-description">{product.description}</p>
                  <button 
                    className="add-to-cart-btn" 
                    onClick={() => addToCart(product.id)}
                    disabled={addingToCart === product.id}
                  >
                    {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === 'cart' && (
          <div className="cart-section">
            <h2>Shopping Cart</h2>
            {cart.length > 0 ? (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={`https://via.placeholder.com/100x75?text=${item.name}`} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p>${item.price}</p>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                ))}
                <div className="cart-total">
                  <h3>Total: ${cartTotal.toFixed(2)}</h3>
                  <button className="checkout-btn" onClick={checkout}>Proceed to Checkout</button>
                </div>
              </div>
            ) : (
              <p className="empty-cart">Your cart is empty.</p>
            )}
          </div>
        )}
      </main>
      {showPayment && (
        <PaymentForm 
          total={cartTotal.toFixed(2)} 
          onPaymentComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
}

export default App;
