/**
 * Unit tests for Payment Service.
 */
import crypto from 'crypto';
import { connectTestDb, disconnectTestDb, clearTestDb } from '../helpers/db.js';
import * as paymentService from '../../services/paymentService.js';
import { createUser, createTransaction } from '../fixtures/factories.js';

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('Payment Service', () => {
  describe('calculatePlatformCommission', () => {
    it('should calculate commission correctly', () => {
      const result = paymentService.calculatePlatformCommission(500);
      expect(result).toBeDefined();
      expect(result.commission + result.helperEarnings).toBeCloseTo(500, 0);
    });

    it('should handle zero price', () => {
      const result = paymentService.calculatePlatformCommission(0);
      expect(result.commission).toBe(0);
      expect(result.helperEarnings).toBe(0);
    });
  });
});
