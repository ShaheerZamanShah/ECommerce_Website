// Environment configuration
const config = {
  development: {
    API_URL: 'http://localhost:3001'
  },
  production: {
    API_URL: '' // Empty for Netlify Functions (same domain)
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment];
