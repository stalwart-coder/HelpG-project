/**
 * Unit tests for Booking Service.
 */
import mongoose from 'mongoose';
import { connectTestDb, disconnectTestDb, clearTestDb } from '../helpers/db.js';
import * as bookingService from '../../services/bookingService.js';
import Booking from '../../models/Booking.js';
import ApiError from '../../utils/ApiError.js';
import { createUser, createBooking, createHelper } from '../fixtures/factories.js';

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('Booking Service', () => {
  describe('createBooking', () => {
    it('should create a booking as customer', async () => {
      const customer = await createUser({ role: 'customer' });
      const booking = await bookingService.createBooking(customer._id, {
        category: 'iron',
        title: 'Test press shirts',
        location: 'Koramangala',
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        price: 500,
        totalAmount: 525,
      });

      expect(booking).toBeDefined();
      expect(booking.customer.toString()).toBe(customer._id.toString());
      expect(booking.status).toBe('pending');
      expect(booking.category).toBe('iron');
    });

    it('should throw 403 if non-customer tries to create booking', async () => {
      const helper = await createUser({ role: 'helper' });
      await expect(
        bookingService.createBooking(helper._id, {
          category: 'iron',
          title: 'Test',
          location: 'Test',
          scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          price: 500,
          totalAmount: 525,
        })
      ).rejects.toThrow('Only customers');
    });

    it('should throw 404 if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        bookingService.createBooking(fakeId.toString(), { category: 'iron', title: 'Test', location: 'Test', scheduledAt: new Date().toISOString(), price: 500, totalAmount: 525 })
      ).rejects.toThrow('not found');
    });
  });

  describe('getBookingById', () => {
    it('should return booking for the customer who owns it', async () => {
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id });
      const result = await bookingService.getBookingById(booking._id.toString(), customer._id.toString());
      expect(result._id.toString()).toBe(booking._id.toString());
    });

    it('should return booking for the assigned helper', async () => {
      const customer = await createUser({ role: 'customer' });
      const helperUser = await createUser({ role: 'helper' });
      const booking = await createBooking({ customer: customer._id, helper: helperUser._id, status: 'confirmed' });
      const result = await bookingService.getBookingById(booking._id.toString(), helperUser._id.toString());
      expect(result._id.toString()).toBe(booking._id.toString());
    });

    it('should throw 403 for unauthorized user', async () => {
      const customer = await createUser({ role: 'customer' });
      const stranger = await createUser({ role: 'customer', phone: '+919000000003', email: 'stranger@example.com' });
      const booking = await createBooking({ customer: customer._id });
      await expect(
        bookingService.getBookingById(booking._id.toString(), stranger._id.toString())
      ).rejects.toThrow('do not have access');
    });

    it('should throw 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const user = await createUser();
      await expect(
        bookingService.getBookingById(fakeId.toString(), user._id.toString())
      ).rejects.toThrow('not found');
    });
  });

  describe('updateBookingStatus', () => {
    it('should accept booking (pending -> confirmed)', async () => {
      const helperUser = await createUser({ role: 'helper' });
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id, status: 'pending' });

      const updated = await bookingService.updateBookingStatus(
        booking._id.toString(), helperUser._id.toString(), 'confirmed'
      );
      expect((updated.helper?._id || updated.helper).toString()).toBe(helperUser._id.toString());
    });

    it('should start task (confirmed -> in_progress)', async () => {
      const helperUser = await createUser({ role: 'helper' });
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({
        customer: customer._id,
        helper: helperUser._id,
        status: 'confirmed',
      });

      const updated = await bookingService.updateBookingStatus(
        booking._id.toString(), helperUser._id.toString(), 'in_progress'
      );
      expect(updated.status).toBe('in_progress');
    });

    it('should reject invalid status transition', async () => {
      const helperUser = await createUser({ role: 'helper' });
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id, status: 'pending' });

      await expect(
        bookingService.updateBookingStatus(
          booking._id.toString(), helperUser._id.toString(), 'completed'
        )
      ).rejects.toThrow('Cannot transition');
    });

    it('should reject update from non-helper to confirmed', async () => {
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id, status: 'pending' });

      await expect(
        bookingService.updateBookingStatus(
          booking._id.toString(), customer._id.toString(), 'confirmed'
        )
      ).rejects.toThrow('Only a helper can accept');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking by customer', async () => {
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id, status: 'confirmed' });

      const cancelled = await bookingService.cancelBooking(
        booking._id.toString(), customer._id.toString(),
        { reason: 'Changed my mind' }
      );
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.cancellation.reason).toBe('Changed my mind');
    });

    it('should cancel booking by helper', async () => {
      const helperUser = await createUser({ role: 'helper' });
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({
        customer: customer._id,
        helper: helperUser._id,
        status: 'confirmed',
      });

      const cancelled = await bookingService.cancelBooking(
        booking._id.toString(), helperUser._id.toString(),
        { reason: 'Emergency' }
      );
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.cancellation.cancelledBy).toBe('helper');
    });

    it('should throw if already completed booking is cancelled', async () => {
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id, status: 'completed' });

      await expect(
        bookingService.cancelBooking(booking._id.toString(), customer._id.toString(), { reason: 'Late' })
      ).rejects.toThrow('Cannot cancel');
    });
  });

  describe('rescheduleBooking', () => {
    it('should reschedule a pending booking', async () => {
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id, status: 'pending' });
      const newDate = new Date(Date.now() + 72 * 60 * 60 * 1000);

      const updated = await bookingService.rescheduleBooking(
        booking._id.toString(), customer._id.toString(),
        { newScheduledAt: newDate.toISOString(), reason: 'Work conflict' }
      );
      expect(updated.scheduledAt.getTime()).toBe(newDate.getTime());
    });

    it('should throw if non-customer tries to reschedule', async () => {
      const helperUser = await createUser({ role: 'helper' });
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id });

      await expect(
        bookingService.rescheduleBooking(booking._id.toString(), helperUser._id.toString(), {
          newScheduledAt: new Date().toISOString(),
        })
      ).rejects.toThrow('Only the customer');
    });

    it('should throw if booking is in_progress', async () => {
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id, status: 'in_progress' });

      await expect(
        bookingService.rescheduleBooking(booking._id.toString(), customer._id.toString(), {
          newScheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        })
      ).rejects.toThrow('Cannot reschedule');
    });
  });
});
