/**
 * Unit tests for Middleware functions.
 */
import { authenticate, authorize } from '../../middleware/auth.js';
import { sanitizeInput } from '../../middleware/sanitize.js';
import User from '../../models/User.js';
import ApiError from '../../utils/ApiError.js';
import { createUser } from '../fixtures/factories.js';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  function mockReqRes(token, user = null) {
    const req = {
      headers: token ? { authorization: `Bearer ${token}` } : {},
      cookies: {},
      user,
    };
    const res = {};
    const next = jest.fn();
    return { req, res, next };
  }

  describe('authenticate', () => {
    it('should throw 401 if no token provided', async () => {
      const { req, res, next } = mockReqRes(null);
      await expect(authenticate(req, res, next)).rejects.toThrow(ApiError);
    });

    it('should throw 401 if token is invalid', async () => {
      const { req, res, next } = mockReqRes('invalid-token-here');
      await expect(authenticate(req, res, next)).rejects.toThrow(ApiError);
    });

    it('should throw 401 if user is deactivated', async () => {
      const user = await createUser({ isActive: false });
      // Create a valid JWT token with the correct secret from env
      const tokenService = await import('../../services/tokenService.js');
      const token = tokenService.generateAccessToken(user);
      const { req, res, next } = mockReqRes(token);

      await expect(authenticate(req, res, next)).rejects.toThrow(/deactivated/i);
    });
  });

  describe('authorize', () => {
    it('should pass if user has required role', () => {
      const req = { user: { role: 'helper' } };
      const res = {};
      const next = jest.fn();
      const middleware = authorize('helper', 'admin');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should throw 403 if user lacks required role', () => {
      const req = { user: { role: 'customer' } };
      const res = {};
      const next = jest.fn();
      const middleware = authorize('helper');
      expect(() => middleware(req, res, next)).toThrow(ApiError);
    });

    it('should throw 401 if user is not authenticated', () => {
      const req = {};
      const res = {};
      const next = jest.fn();
      const middleware = authorize('helper');
      expect(() => middleware(req, res, next)).toThrow('Authentication required');
    });
  });
});

describe('Sanitize Middleware', () => {
  it('should sanitize HTML entities in body strings', () => {
    const req = {
      body: { name: '<script>alert("xss")</script>', age: 25 },
      query: {},
      params: {},
    };
    const res = {};
    const next = jest.fn();

    sanitizeInput(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body.name).toBe('<script>alert("xss")</script>');
    expect(req.body.age).toBe(25);
  });

  it('should sanitize nested objects', () => {
    const req = {
      body: { user: { name: '<img onerror="alert(1)" src=x>' } },
      query: {},
      params: {},
    };
    const res = {};
    const next = jest.fn();

    sanitizeInput(req, res, next);
    expect(req.body.user.name).toBe('<img onerror="alert(1)" src=x>');
  });

  it('should sanitize arrays', () => {
    const req = {
      body: { tags: ['<b>bold</b>', 'normal'] },
      query: {},
      params: {},
    };
    const res = {};
    const next = jest.fn();

    sanitizeInput(req, res, next);
    expect(req.body.tags[0]).toBe('<b>bold</b>');
    expect(req.body.tags[1]).toBe('normal');
  });

  it('should handle null/undefined values', () => {
    const req = { body: null, query: {}, params: {} };
    const res = {};
    const next = jest.fn();
    sanitizeInput(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should sanitize query params', () => {
    const req = {
      body: {},
      query: { search: '<script>alert("xss")</script>' },
      params: {},
    };
    const res = {};
    const next = jest.fn();
    sanitizeInput(req, res, next);
    expect(req.query.search).toBe('<script>alert("xss")</script>');
  });
});

describe('ApiError', () => {
  it('should create error with correct status and message', () => {
    const err = new ApiError(400, 'Bad request');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad request');
    expect(err.isOperational).toBe(true);
    expect(err.status).toBe('fail');
  });

  it('should create server error status for 5xx', () => {
    const err = new ApiError(500, 'Server error');
    expect(err.status).toBe('error');
  });

  it('should accept non-operational errors', () => {
    const err = new ApiError(500, 'Critical', false);
    expect(err.isOperational).toBe(false);
  });
});
