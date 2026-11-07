/**
 * API Integration tests for Auth endpoints.
 */
import express from 'express';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import apiRoutes from '../../routes/apiRoutes.js';
import { errorConverter, errorHandler } from '../../middleware/errorHandler.js';
import { createUser, createOtp } from '../fixtures/factories.js';
import User from '../../models/User.js';
import Otp from '../../models/Otp.js';

// Build test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', apiRoutes);
app.use(errorConverter);
app.use(errorHandler);

describe('Auth API', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user and return 201', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          phone: '+919876543210',
          email: 'testapi@example.com',
          password: 'password123',
          role: 'customer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.name).toBe('Test User');
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should return 409 for duplicate phone', async () => {
      await createUser({ phone: '+919876543211' });
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Duplicate',
          phone: '+919876543211',
          password: 'password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'No Password' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Bad Email',
          phone: '+919876543212',
          email: 'not-an-email',
          password: 'password123',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with email and password', async () => {
      await createUser({
        email: 'loginapi@example.com',
        password: 'password123',
        phone: '+919876543213',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ emailOrPhone: 'loginapi@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should login with phone and password', async () => {
      await createUser({
        email: 'phoneapi@example.com',
        password: 'password123',
        phone: '+919876543213',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ emailOrPhone: '+919876543213', password: 'password123' });

      expect(res.status).toBe(200);
    });

    it('should return 401 for wrong password', async () => {
      await createUser({
        email: 'loginapi@example.com',
        password: 'password123',
        phone: '+919876543212',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ emailOrPhone: 'loginapi@example.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/send-otp', () => {
    it('should send OTP and return it in dev mode', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: '+919876543214', purpose: 'login' });

      expect(res.status).toBe(200);
      expect(res.body.data.otp).toBeDefined();
      expect(res.body.data.otp).toHaveLength(6);
    });

    it('should return 400 for invalid phone', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: 'invalid', purpose: 'login' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should verify a valid OTP', async () => {
      await createOtp({ phone: '+919876543215', otp: '555555', purpose: 'login' });
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phone: '+919876543215', otp: '555555' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid OTP', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phone: '+919876543215', otp: '000000' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and clear refresh token', async () => {
      const user = await createUser();
      const { generateAuthTokens } = await import('../../services/tokenService.js');
      const tokens = generateAuthTokens(user);
      user.refreshToken = tokens.refreshToken;
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(res.status).toBe(200);

      const updated = await User.findById(user._id).select('+refreshToken');
      expect(updated.refreshToken).toBeUndefined();
    });
  });
});
