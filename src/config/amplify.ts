import { Amplify } from 'aws-amplify';
import { API_CONFIG } from '../config';

try {
  // Production configuration
  const config = {
    Auth: {
      Cognito: {
        userPoolId: 'us-east-1_kheLDlA3a',
        userPoolClientId: '75v2a6o0hn3gr7v8651bi8tj2o',
        signUpVerificationMethod: 'code' as const,
        region: 'us-east-1'
      }
    },
    API: {
      REST: {
        blog: {
          endpoint: API_CONFIG.API_URL,
          region: 'us-east-1'
        }
      }
    }
  } as const;

  console.log('Initializing Amplify with config:', JSON.stringify(config, null, 2));
  Amplify.configure(config);
  console.log('Amplify configuration completed successfully');
} catch (error) {
  console.error('Error configuring Amplify:', error);
} 