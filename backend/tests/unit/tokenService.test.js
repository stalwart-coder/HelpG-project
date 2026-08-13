/**
 * Unit tests for Token Service.
 */
import jwt from 'jsonwebtoken';
import { connectTestDb, disconnectTestDb, clearTestDb } from '../helpers/db.js';
import * as tokenService from '../../services/tokenService.js';
import ApiError from '../../utils/ApiError.js';
import { createUser } from '../fixtures/factories.js';

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('Token Service', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', async () => {
      const user = await createUser();
      const token = tokenService.generateAccessToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token);
      expect(decoded.id).toBe(user._id.toString());
      expect(decoded.role).toBe('customer');
      expect(decoded.email).toBe(user.email);
      expect(decoded.phone).toBe(user.phone);
      expect(decoded.type).toBe('user');
    });

    it('should generate admin type token', async () => {
      const user = await createUser({ role: 'admin' });
      const token = tokenService.generateAccessToken(user, 'admin');
      const decoded = jwt.decode(token);
      expect(decoded.type).toBe('admin');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', async () => {
      const user = await createUser();
      const token = tokenService.generateRefreshToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token);
      expect(decoded.id).toBe(user._id.toString());
      expect(decoded.role).toBeUndefined();
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', async () => {
      const user = await createUser();
      const token = tokenService.generateAccessToken(user);
      const decoded = tokenService.verifyAccessToken(token);
      expect(decoded.id).toBe(user._id.toString());
    });

    it('should throw 401 for malformed token', () => {
      expect(() => tokenService.verifyAccessToken('not-a-valid-token')).toThrow(ApiError);
    });
  });

  describe('generateAuthTokens', () => {
    it('should generate both access and refresh tokens', async () => {
      const user = await createUser();
      const tokens = tokenService.generateAuthTokens(user);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);

      const accessDecoded = jwt.decode(tokens.accessToken);
      const refreshDecoded = jwt.decode(tokens.refreshToken);
      expect(accessDecoded.id).toBe(user._id.toString());
      expect(refreshDecoded.id).toBe(user._id.toString());
    });
  });
});
