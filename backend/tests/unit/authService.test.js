/**
 * Unit tests for Auth Service.
 */
import mongoose from 'mongoose';
import { connectTestDb, disconnectTestDb, clearTestDb } from '../helpers/db.js';
import * as authService from '../../services/authService.js';
import User from '../../models/User.js';
import Otp from '../../models/Otp.js';
import ApiError from '../../utils/ApiError.js';
import { createUser, createOtp } from '../fixtures/factories.js';

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('Auth Service', () => {
  describe('signup', () => {
    it('should create a new user and return tokens', async () => {
      const result = await authService.signup({
        name: 'New User',
        phone: '+919999999999',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'customer',
      });

      expect(result.user).toBeDefined();
      expect(result.user.name).toBe('New User');
      expect(result.user.phone).toBe('+919999999999');
      expect(result.user.role).toBe('customer');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.password).toBeUndefined();
    });

    it('should throw 409 if phone already exists', async () => {
      await createUser({ phone: '+919999999999' });
      await expect(
        authService.signup({
          name: 'Duplicate',
          phone: '+919999999999',
          password: 'password123',
        })
      ).rejects.toThrow(ApiError);
    });

    it('should throw 409 if email already exists', async () => {
      await createUser({ email: 'taken@example.com' });
      await expect(
        authService.signup({
          name: 'Duplicate Email',
          phone: '+919888888888',
          email: 'taken@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('already exists');
    });

    it('should create user without email', async () => {
      const result = await authService.signup({
        name: 'No Email',
        phone: '+919777777777',
        password: 'password123',
      });
      expect(result.user.email).toBeUndefined();
    });

    it('should default role to customer', async () => {
      const result = await authService.signup({
        name: 'Default Role',
        phone: '+919666666666',
        password: 'password123',
      });
      expect(result.user.role).toBe('customer');
    });
  });

  describe('login', () => {
    it('should login with email and password', async () => {
      await createUser({
        email: 'login@example.com',
        password: 'mypassword',
      });
      const result = await authService.login('login@example.com', 'mypassword');
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should login with phone and password', async () => {
      await createUser({
        phone: '+919555555555',
        password: 'mypassword',
      });
      const result = await authService.login('+919555555555', 'mypassword');
      expect(result.user).toBeDefined();
    });

    it('should throw 400 if credentials missing', async () => {
      await expect(authService.login('', '')).rejects.toThrow(ApiError);
    });

    it('should throw 401 if user not found', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow(ApiError);
    });

    it('should throw 401 if password is wrong', async () => {
      await createUser({ email: 'wrongpw@example.com', password: 'correctpw' });
      await expect(
        authService.login('wrongpw@example.com', 'wrongpassword')
      ).rejects.toThrow(ApiError);
    });

    it('should throw 401 if account is deactivated', async () => {
      await createUser({
        email: 'inactive@example.com',
        password: 'password123',
        isActive: false,
      });
      await expect(
        authService.login('inactive@example.com', 'password123')
      ).rejects.toThrow('deactivated');
    });
  });

  describe('sendOtp', () => {
    it('should create an OTP and return success message', async () => {
      const result = await authService.sendOtp('+919444444444', 'login');
      expect(result.message).toBe('OTP sent successfully');
    });

    it('should invalidate previous unused OTPs', async () => {
      await createOtp({ phone: '+919333333333', purpose: 'login', otp: '111111' });
      await authService.sendOtp('+919333333333', 'login');
      const oldOtps = await Otp.find({ phone: '+919333333333', purpose: 'login', isUsed: false });
      expect(oldOtps).toHaveLength(1);
      const newOtp = oldOtps[0];
      expect(newOtp.otp).not.toBe('111111');
    });
  });

  describe('verifyOtp', () => {
    it('should verify a valid OTP', async () => {
      await createOtp({ phone: '+919222222222', otp: '654321' });
      const result = await authService.verifyOtp('+919222222222', '654321');
      expect(result.valid).toBe(true);
    });

    it('should throw 400 for invalid OTP', async () => {
      await expect(
        authService.verifyOtp('+919111111111', '000000')
      ).rejects.toThrow(ApiError);
    });

    it('should throw 400 for expired OTP', async () => {
      await createOtp({
        phone: '+919000000099',
        otp: '999999',
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(
        authService.verifyOtp('+919000000099', '999999')
      ).rejects.toThrow('expired');
    });
  });

  describe('forgotPassword', () => {
    it('should send OTP for existing user', async () => {
      await createUser({ phone: '+919000000088' });
      const result = await authService.forgotPassword('+919000000088');
      expect(result.message).toBe('OTP sent successfully');
    });

    it('should throw 404 for non-existent phone', async () => {
      await expect(
        authService.forgotPassword('+919000000077')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid OTP', async () => {
      await createUser({ phone: '+919000000066', password: 'oldpassword' });
      await createOtp({
        phone: '+919000000066',
        otp: '777777',
        purpose: 'password-reset',
      });
      const result = await authService.resetPassword('+919000000066', '777777', 'newpassword');
      expect(result.message).toBe('Password reset successful.');
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      const user = await createUser();
      user.refreshToken = 'some-refresh-token';
      await user.save({ validateBeforeSave: false });

      await authService.logout(user._id.toString());

      const updated = await User.findById(user._id).select('+refreshToken');
      expect(updated.refreshToken).toBeUndefined();
    });
  });
});
