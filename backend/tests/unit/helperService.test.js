/**
 * Unit tests for Helper Service.
 */
import mongoose from 'mongoose';
import * as helperService from '../../services/helperService.js';
import HelperProfile from '../../models/HelperProfile.js';
import Booking from '../../models/Booking.js';
import ApiError from '../../utils/ApiError.js';
import { createUser, createHelper, createBooking } from '../fixtures/factories.js';

describe('Helper Service', () => {
  describe('getHelperProfile', () => {
    it('should return helper profile with user info', async () => {
      const { user, profile } = await createHelper();
      const result = await helperService.getHelperProfile(user._id.toString());
      expect(result).toBeDefined();
      expect(result.user._id.toString()).toBe(user._id.toString());
      expect(result.profile.averageRating).toBe(4.5);
      expect(result.profile.totalCompletedJobs).toBe(10);
    });

    it('should throw 404 if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        helperService.getHelperProfile(fakeId.toString())
      ).rejects.toThrow('not found');
    });

    it('should create profile on-the-fly if not exists', async () => {
      const user = await createUser({ role: 'helper' });
      const result = await helperService.getHelperProfile(user._id.toString());
      expect(result.profile).toBeDefined();
      expect(result.profile.totalCompletedJobs).toBe(0);
    });
  });

  describe('updateHelperProfile', () => {
    it('should update helper profile fields', async () => {
      const { user, profile } = await createHelper();
      const updates = {
        gender: 'female',
        experienceYears: 5,
        languages: ['English', 'Hindi', 'Punjabi'],
      };
      const updated = await helperService.updateHelperProfile(user._id.toString(), updates);
      expect(updated.gender).toBe('female');
      expect(updated.experienceYears).toBe(5);
      expect(updated.languages).toHaveLength(3);
    });

    it('should create profile if not exists', async () => {
      const user = await createUser({ role: 'helper', isKycVerified: true });
      const updated = await helperService.updateHelperProfile(user._id.toString(), {
        gender: 'male',
        experienceYears: 3,
        languages: ['English'],
      });
      expect(updated).toBeDefined();
      expect(updated.gender).toBe('male');
      expect(updated.userId.toString()).toBe(user._id.toString());
    });
  });

  describe('acceptBooking', () => {
    it('should accept a pending booking', async () => {
      const { user: helper } = await createHelper();
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id, status: 'pending' });

      const result = await helperService.acceptBooking(booking._id.toString(), helper._id.toString());
      expect(result.status).toBe('confirmed');
    });

    it('should throw if helper is not KYC verified', async () => {
      const user = await createUser({ role: 'helper', isKycVerified: false });
      await HelperProfile.create({ userId: user._id, kycStatus: 'pending' });
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id, status: 'pending' });

      await expect(
        helperService.acceptBooking(booking._id.toString(), user._id.toString())
      ).rejects.toThrow('verified');
    });

    it('should throw if booking is not pending', async () => {
      const { user: helper } = await createHelper();
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id, status: 'confirmed' });

      await expect(
        helperService.acceptBooking(booking._id.toString(), helper._id.toString())
      ).rejects.toThrow('pending');
    });
  });

  describe('rejectBooking', () => {
    it('should reject a pending booking with reason', async () => {
      const { user: helper } = await createHelper();
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({ customer: customer._id, status: 'pending' });

      const result = await helperService.rejectBooking(booking._id.toString(), helper._id.toString(), 'Too far away');
      expect(result.status).toBe('pending');
    });
  });

  describe('startTask', () => {
    it('should start a confirmed task', async () => {
      const { user: helper } = await createHelper();
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({
        customer: customer._id,
        helper: helper._id,
        status: 'confirmed',
      });

      const result = await helperService.startTask(booking._id.toString(), helper._id.toString());
      expect(result.status).toBe('in_progress');
    });
  });

  describe('completeTask', () => {
    it('should complete an in_progress task and update stats', async () => {
      const { user: helper } = await createHelper();
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({
        customer: customer._id,
        helper: helper._id,
        status: 'in_progress',
        price: 500,
        totalAmount: 525,
      });

      const result = await helperService.completeTask(booking._id.toString(), helper._id.toString());
      expect(result.status).toBe('completed');

      // Check that helper stats updated
      const profile = await HelperProfile.findOne({ userId: helper._id });
      expect(profile.totalCompletedJobs).toBe(11);
      expect(profile.totalEarnings).toBeGreaterThan(0);
    });
  });

  describe('markArrived', () => {
    it('should mark a confirmed booking as arrived', async () => {
      const { user: helper } = await createHelper();
      const customer = await createUser({ role: 'customer' });
      const booking = await createBooking({
        customer: customer._id,
        helper: helper._id,
        status: 'confirmed',
      });

      const result = await helperService.markArrived(booking._id.toString(), helper._id.toString());
      const timeline = result.timeline;
      const arrivedEntry = timeline.find(t => t.note && t.note.includes('arrived'));
      expect(arrivedEntry).toBeDefined();
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle helper availability', async () => {
      const { user } = await createHelper();
      const result = await helperService.toggleAvailability(user._id.toString(), false);
      expect(result.isAvailable).toBe(false);

      const result2 = await helperService.toggleAvailability(user._id.toString(), true);
      expect(result2.isAvailable).toBe(true);
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard stats', async () => {
      const { user } = await createHelper();
      const customer = await createUser({ role: 'customer' });
      await createBooking({
        customer: customer._id,
        helper: user._id,
        status: 'completed',
      });

      const dashboard = await helperService.getDashboard(user._id.toString());
      expect(dashboard.profile).toBeDefined();
      expect(dashboard.todayBookings).toBeDefined();
      expect(dashboard.availableTaskCount).toBeDefined();
    });
  });

  describe('getEarningsSummary', () => {
    it('should return earnings summary', async () => {
      const { user } = await createHelper();
      const summary = await helperService.getEarningsSummary(user._id.toString());
      expect(summary.totalEarnings).toBeDefined();
      // monthEarnings - not monthlyEarnings
      expect(summary.monthEarnings).toBeDefined();
    });
  });

  describe('getBookingHistory', () => {
    it('should return booking history with filters', async () => {
      const { user: helper } = await createHelper();
      const customer = await createUser({ role: 'customer' });
      await createBooking({
        customer: customer._id,
        helper: helper._id,
        status: 'completed',
      });
      await createBooking({
        customer: customer._id,
        helper: helper._id,
        status: 'cancelled',
      });

      const history = await helperService.getBookingHistory(helper._id.toString(), {});
      expect(history.bookings).toHaveLength(2);

      const completedOnly = await helperService.getBookingHistory(helper._id.toString(), { status: 'completed' });
      expect(completedOnly.bookings).toHaveLength(1);
    });
  });
});
