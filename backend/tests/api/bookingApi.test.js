/**
 * API Integration tests for Booking endpoints.
 */
import express from 'express';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import apiRoutes from '../../routes/apiRoutes.js';
import { errorConverter, errorHandler } from '../../middleware/errorHandler.js';
import { createUser, createBooking } from '../fixtures/factories.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', apiRoutes);
app.use(errorConverter);
app.use(errorHandler);

let customerToken, helperToken, customerId, helperId;

beforeEach(async () => {
  const customerRes = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Booking Customer',
      email: `cust${Date.now()}@test.com`,
      phone: `+9190000${String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0')}`,
      password: 'password123',
      role: 'customer',
    });
  customerToken = customerRes.body.data.accessToken;
  customerId = customerRes.body.data.user._id;

  const helperRes = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Booking Helper',
      email: `helper${Date.now()}@test.com`,
      phone: `+9190000${String(Math.floor(Math.random() * 90000) + 50000).padStart(5, '0')}`,
      password: 'password123',
      role: 'helper',
    });
  helperToken = helperRes.body.data.accessToken;
  helperId = helperRes.body.data.user._id;
});

describe('Booking API', () => {
  const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  let bookingId;

  it('POST /api/bookings - should create a booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        category: 'iron',
        title: 'Iron 10 shirts integration test',
        description: 'Need professional ironing',
        location: 'Koramangala, Bengaluru',
        scheduledAt: futureDate,
        price: 500,
        totalAmount: 525,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    bookingId = res.body.data._id;
  });

  it('GET /api/bookings/mine - should return customer bookings', async () => {
    // Create a booking first
    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ category: 'iron', title: 'My Booking', location: 'Test', scheduledAt: futureDate, price: 100, totalAmount: 100 });

    const res = await request(app)
      .get('/api/bookings/mine')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.bookings.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/bookings/available - should return pending bookings for helpers', async () => {
    const res = await request(app)
      .get('/api/bookings/available')
      .set('Authorization', `Bearer ${helperToken}`);
    expect(res.status).toBe(200);
  });

  it('PATCH /api/bookings/:id/status - should accept booking', async () => {
    // Create a booking
    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ category: 'vehicle', title: 'Car wash', location: 'Test St', scheduledAt: futureDate, price: 200, totalAmount: 200 });

    const res = await request(app)
      .patch(`/api/bookings/${createRes.body.data._id}/status`)
      .set('Authorization', `Bearer ${helperToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('confirmed');
  });

  it('POST /api/bookings/:id/cancel - should cancel booking', async () => {
    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ category: 'guard', title: 'Security guard', location: 'Test St', scheduledAt: futureDate, price: 500, totalAmount: 500 });

    const res = await request(app)
      .post(`/api/bookings/${createRes.body.data._id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Not needed' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
  });

  it('GET /api/bookings/:id - should return 404 for non-existent', async () => {
    const { default: mongoose } = await import('mongoose');
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/bookings/${fakeId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(404);
  });

  it('should reject unauthenticated access', async () => {
    const res = await request(app).get('/api/bookings/mine');
    expect(res.status).toBe(401);
  });
});
