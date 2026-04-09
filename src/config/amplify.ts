import { Amplify } from 'aws-amplify';
import { API_CONFIG } from '../config';

try {
  const config = {
    Auth: {
      Cognito: {
        userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
        userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || '',
        signUpVerificationMethod: 'code' as const,
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
      }
    },
    API: {
      REST: {
        blog: {
          endpoint: API_CONFIG.API_URL,
          region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
        }
      }
    }
  } as const;

  Amplify.configure(config);
} catch (error) {
  console.error('Error configuring Amplify:', error);
} 