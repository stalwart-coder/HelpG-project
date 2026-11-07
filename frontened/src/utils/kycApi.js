/**
 * KYC API client.
 * Provides methods for all KYC-related API calls.
 */
import api, { getAccessToken } from './apiClient.js';

/**
 * Get current user's KYC status.
 * @returns {Promise<Object>} { kyc, kycStatus }
 */
export async function getKycStatus() {
  const response = await api.get('/kyc/status');
  return response.data;
}

/**
 * Submit KYC documents.
 * @param {Object} kycData - { personalInfo, aadhaar, pan, selfie, bankDetails }
 * @returns {Promise<Object>} Updated KYC record
 */
export async function submitKyc(kycData) {
  const response = await api.post('/kyc/submit', kycData);
  return response.data;
}

/**
 * Re-submit rejected KYC.
 * @param {Object} kycData - { personalInfo, aadhaar, pan, selfie, bankDetails }
 * @returns {Promise<Object>} Updated KYC record
 */
export async function resubmitKyc(kycData) {
  const response = await api.post('/kyc/resubmit', kycData);
  return response.data;
}

/**
 * Update bank account details.
 * @param {Object} bankData - { accountNumber, ifscCode, accountHolderName, bankName }
 * @returns {Promise<Object>} Updated KYC record
 */
export async function updateBankDetails(bankData) {
  const response = await api.put('/kyc/bank-details', bankData);
  return response.data;
}

/**
 * Update UPI ID.
 * @param {Object} upiData - { upiId }
 * @returns {Promise<Object>} Updated KYC record
 */
export async function updateUpi(upiData) {
  const response = await api.put('/kyc/upi', upiData);
  return response.data;
}

/**
 * Upload a document file.
 * @param {string} fieldName - The field name (e.g. 'aadhaarFront', 'panImage', 'selfie')
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} { url, fieldName }
 */
export async function uploadDocument(fieldName, file) {
  const formData = new FormData();
  formData.append(fieldName, file);

  const token = getAccessToken?.() || '';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Upload failed');
  }
  return data.data;
}

export default {
  getKycStatus,
  submitKyc,
  resubmitKyc,
  updateBankDetails,
  updateUpi,
  uploadDocument,
};
