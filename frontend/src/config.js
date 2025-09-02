// Environment configuration
const config = {
  development: {
    API_URL: 'http://localhost:3001'
  },
  production: {
    API_URL: 'https://your-backend-url.railway.app' // Replace with your Railway backend URL
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment];
