import { body, param } from 'express-validator';

export const submitKycRules = [
  body('personalInfo').optional().isObject().withMessage('Personal info must be an object'),
  body('personalInfo.fullName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('personalInfo.dob').optional().trim().isLength({ min: 8, max: 10 }).withMessage('Invalid date of birth'),
  body('personalInfo.address').optional().trim().isLength({ min: 5, max: 500 }).withMessage('Address must be 5-500 characters'),
  body('personalInfo.city').optional().trim().isLength({ min: 2, max: 100 }).withMessage('City must be 2-100 characters'),
  body('personalInfo.pincode').optional().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  body('aadhaar').optional().isObject().withMessage('Aadhaar must be an object'),
  body('aadhaar.number').optional().matches(/^\d{12}$/).withMessage('Aadhaar number must be 12 digits'),
  body('pan').optional().isObject().withMessage('PAN must be an object'),
  body('pan.number').optional().matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/).withMessage('Invalid PAN number format'),
  body('bankDetails').optional().isObject().withMessage('Bank details must be an object'),
  body('bankDetails.ifscCode').optional().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC code'),
  body('bankDetails.upiId').optional().matches(/^[\w.\-_]+@[\w.\-_]+$/).withMessage('Invalid UPI ID format'),
];

export const updateBankRules = [
  body('accountNumber').notEmpty().withMessage('Account number is required').isLength({ min: 9, max: 18 }).withMessage('Account number must be 9-18 digits'),
  body('ifscCode').notEmpty().withMessage('IFSC code is required').matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC code'),
  body('accountHolderName').notEmpty().withMessage('Account holder name is required').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('bankName').optional().trim().isLength({ max: 100 }).withMessage('Bank name too long'),
];

export const updateUpiRules = [
  body('upiId').notEmpty().withMessage('UPI ID is required').matches(/^[\w.\-_]+@[\w.\-_]+$/).withMessage('Invalid UPI ID format'),
];

export const kycIdParam = [
  param('id').isMongoId().withMessage('Invalid KYC ID'),
];

export default { submitKycRules, updateBankRules, updateUpiRules, kycIdParam };
