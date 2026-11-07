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
  const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  it('should execute complete helper workflow from booking to earnings', async () => {
    // Step 1: Customer creates a booking
    const customerRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Customer Sr',
        email: `cust-sr-${Date.now()}@test.com`,
        phone: `+9190000${String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0')}`,
        password: 'password123',
        role: 'customer',
      });
    expect(customerRes.status).toBe(201);
    const customerToken = customerRes.body.data.accessToken;
    const customerId = customerRes.body.data.user._id;

    const bookingRes = await request(app)
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
    expect(bookingRes.status).toBe(201);
    const bookingId = bookingRes.body.data._id;

    // Step 2: Helper signup and accept booking
    const helperRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Helper Jr',
        email: `helper-jr-${Date.now()}@test.com`,
        phone: `+9190000${String(Math.floor(Math.random() * 90000) + 50000).padStart(5, '0')}`,
        password: 'password123',
        role: 'helper',
      });
    expect(helperRes.status).toBe(201);
    const helperToken = helperRes.body.data.accessToken;
    const helperId = helperRes.body.data.user._id;

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
    const acceptRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${helperToken}`)
      .send({ status: 'confirmed', note: 'I accept this job' });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.status).toBe('confirmed');

    // Step 3: Helper starts task
    const startRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${helperToken}`)
      .send({ status: 'in_progress' });
    expect(startRes.status).toBe(200);
    expect(startRes.body.data.status).toBe('in_progress');

    // Step 4: Helper completes task
    const completeRes = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${helperToken}`)
      .send({ status: 'completed' });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe('completed');

    // Step 5: Helper checks dashboard
    const dashRes = await request(app)
      .get('/api/helpers/dashboard')
      .set('Authorization', `Bearer ${helperToken}`);
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data).toBeDefined();

    // Step 6: Customer views completed booking
    const viewRes = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(viewRes.status).toBe(200);
    expect(viewRes.body.data.timeline.length).toBeGreaterThanOrEqual(4);

    // Step 7: Helper checks earnings
    const earnRes = await request(app)
      .get('/api/helpers/earnings/summary')
      .set('Authorization', `Bearer ${helperToken}`);
    expect(earnRes.status).toBe(200);
  });
});
