// Configuration for deployment
export const API_CONFIG = {
  // API Gateway URL from environment variable or CDK output
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  
  // Environment configuration
  ENVIRONMENT: process.env.NODE_ENV || 'development'
};

export default API_CONFIG; 