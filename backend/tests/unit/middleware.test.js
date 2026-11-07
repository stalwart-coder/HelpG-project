import { jest } from '@jest/globals';
import { authenticate, authorize } from '../../middleware/auth.js';
import { sanitizeInput } from '../../middleware/sanitize.js';
import User from '../../models/User.js';
import ApiError from '../../utils/ApiError.js';
import { createUser } from '../fixtures/factories.js';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  function runAuth(token) {
    return new Promise((resolve) => {
      const req = {
        headers: token ? { authorization: `Bearer ${token}` } : {},
        cookies: {},
      };
      const res = {};
      const next = jest.fn((err) => resolve({ req, res, next, err }));
      authenticate(req, res, next);
    });
  }

  describe('authenticate', () => {
    it('should pass error to next if no token provided', async () => {
      const { next, err } = await runAuth(null);
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(err.statusCode).toBe(401);
    });

    it('should pass error to next if token is invalid', async () => {
      const { next, err } = await runAuth('invalid-token-here');
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(err.statusCode).toBe(401);
    });

    it('should pass error to next if user is deactivated', async () => {
      const user = await createUser({ isActive: false });
      const tokenService = await import('../../services/tokenService.js');
      const token = tokenService.generateAccessToken(user);
      const { next, err } = await runAuth(token);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      expect(err.message).toMatch(/deactivated/i);
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
    expect(req.body.name).toBe('&lt;script&gt;alert("xss")&lt;&#x2F;script&gt;');
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
    expect(req.body.user.name).toBe('&lt;img onerror="alert(1)" src=x&gt;');
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
    expect(req.body.tags[0]).toBe('&lt;b&gt;bold&lt;&#x2F;b&gt;');
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
    expect(req.query.search).toBe('&lt;script&gt;alert("xss")&lt;&#x2F;script&gt;');
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
