/**
 * AWS Cognito Service
 * Direct client-side calls to Cognito for email verification.
 * Used after registration to confirm user accounts via OTP code.
 */
import {
  CognitoUserPool,
  CognitoUser,
} from 'amazon-cognito-identity-js';
import { COGNITO_CONFIG } from '@/config';

// Initialize Cognito User Pool
const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_CONFIG.USER_POOL_ID,
  ClientId: COGNITO_CONFIG.CLIENT_ID,
});

/**
 * Get a CognitoUser instance for the given email
 */
function getCognitoUser(email) {
  return new CognitoUser({
    Username: email,
    Pool: userPool,
  });
}

/**
 * Confirm registration with verification code
 * @param {string} email - User's email
 * @param {string} code - 6-digit verification code from email
 * @returns {Promise<string>} - Resolves with 'SUCCESS'
 */
export function confirmRegistration(email, code) {
  return new Promise((resolve, reject) => {
    const cognitoUser = getCognitoUser(email);
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

/**
 * Resend verification code to user's email
 * @param {string} email - User's email
 * @returns {Promise<string>} - Resolves with delivery details
 */
export function resendConfirmationCode(email) {
  return new Promise((resolve, reject) => {
    const cognitoUser = getCognitoUser(email);
    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}
