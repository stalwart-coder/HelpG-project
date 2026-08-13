/**
 * Integration tests for complete Helper workflow.
 */
import express from 'express';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import apiRoutes from '../../routes/apiRoutes.js';
import { errorConverter, errorHandler } from '../../middleware/errorHandler.js';
import HelperProfile from '../../models/HelperProfile.js';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', apiRoutes);
app.use(errorConverter);
app.use(errorHandler);

describe('Complete Helper Workflow', () => {
  let customerToken, helperToken, helperId, customerId, bookingId;
  const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  it('Step 1: Customer creates a booking', async () => {
    const customerRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Customer Sr',
        email: `cust-sr-${Date.now()}@test.com`,
        phone: `+9190000${String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0')}`,
        password: 'password123',
        role: 'customer',
      });
    customerToken = customerRes.body.data.accessToken;
    customerId = customerRes.body.data.user._id;

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        category: 'vehicle',
        title: 'Full car wash service',
        description: 'Exterior and interior cleaning',
        location: 'Koramangala, Bengaluru',
        scheduledAt: futureDate,
        price: 300,
        totalAmount: 315,
      });
    expect(res.status).toBe(201);
    bookingId = res.body.data._id;
  });

  it('Step 2: Helper signup and accept booking', async () => {
    const helperRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Helper Jr',
        email: `helper-jr-${Date.now()}@test.com`,
        phone: `+9190000${String(Math.floor(Math.random() * 90000) + 50000).padStart(5, '0')}`,
        password: 'password123',
        role: 'helper',
      });
    helperToken = helperRes.body.data.accessToken;
    helperId = helperRes.body.data.user._id;

    // Create helper profile with verified KYC
    await HelperProfile.create({
      userId: helperId,
      gender: 'male',
      skills: [{ categoryId: new mongoose.Types.ObjectId(), experience: 3 }],
      languages: ['English', 'Hindi'],
      kycStatus: 'verified',
      averageRating: 4.5,
      totalCompletedJobs: 5,
      totalEarnings: 2500,
    });

    // Accept the booking
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${helperToken}`)
      .send({ status: 'confirmed', note: 'I accept this job' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('confirmed');
  });

  it('Step 3: Helper starts task', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${helperToken}`)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
  });

  it('Step 4: Helper completes task', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${helperToken}`)
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
  });

  it('Step 5: Helper checks dashboard', async () => {
    // Skip if helperToken not set (from previous test)
    if (!helperToken) return;
    const res = await request(app)
      .get('/api/helpers/dashboard')
      .set('Authorization', `Bearer ${helperToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('Step 6: Customer views completed booking', async () => {
    const res = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.timeline.length).toBeGreaterThanOrEqual(4);
  });

  it('Step 7: Helper checks earnings', async () => {
    if (!helperToken) return;
    const res = await request(app)
      .get('/api/helpers/earnings/summary')
      .set('Authorization', `Bearer ${helperToken}`);
    expect(res.status).toBe(200);
  });
});
