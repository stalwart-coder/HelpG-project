import { createContext, useContext, useState, useCallback } from 'react';
import { myBookingsData } from '../data/mockData';
import * as helperApi from '../utils/helperApi';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [mode, setMode] = useState('customer'); // 'customer' | 'helper'
  const [helperBookings, setHelperBookings] = useState([]);
  const [helperProfile, setHelperProfile] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [helperAvailability, setHelperAvailability] = useState(null);
  const [helperSchedule, setHelperSchedule] = useState(null);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [helperLoading, setHelperLoading] = useState(false);
  const [helperError, setHelperError] = useState(null);

  // ── Load helper profile ──────────────────────────────────────────────
  const loadHelperProfile = useCallback(async () => {
    setHelperLoading(true);
    setHelperError(null);
    try {
      const data = await helperApi.getHelperProfile();
      setHelperProfile(data);
      return data;
    } catch (error) {
      setHelperError(error.message);
      return null;
    } finally {
      setHelperLoading(false);
    }
  }, []);

  // ── Update helper profile ────────────────────────────────────────────
  const updateHelperProfile = useCallback(async (profileData) => {
    setHelperLoading(true);
    setHelperError(null);
    try {
      const data = await helperApi.updateHelperProfile(profileData);
      setHelperProfile(data);
      return data;
    } catch (error) {
      setHelperError(error.message);
      return null;
    } finally {
      setHelperLoading(false);
    }
  }, []);

  // ── Load dashboard / available tasks ─────────────────────────────────
  const loadHelperDashboard = useCallback(async () => {
    setHelperLoading(true);
    setHelperError(null);
    try {
      const data = await helperApi.getHelperDashboard();
      setAvailableTasks(data.availableTaskCount > 0 ? [] : []);
      setHelperProfile(data.profile);
      return data;
    } catch (error) {
      setHelperError(error.message);
      return null;
    } finally {
      setHelperLoading(false);
    }
  }, []);

  // ── Accept helper task (real API) ────────────────────────────────────
  const acceptHelperTask = useCallback(async (bookingId, note = '') => {
    setHelperError(null);
    try {
      const data = await helperApi.acceptBooking(bookingId, note);
      setHelperBookings((prev) => {
        if (prev.some((b) => b._id === data._id)) return prev;
        return [data, ...prev];
      });
      return data;
    } catch (error) {
      setHelperError(error.message);
      throw error;
    }
  }, []);

  // ── Reject booking ───────────────────────────────────────────────────
  const rejectBooking = useCallback(async (bookingId, reason = '') => {
    setHelperError(null);
    try {
      const data = await helperApi.rejectBooking(bookingId, reason);
      return data;
    } catch (error) {
      setHelperError(error.message);
      throw error;
    }
  }, []);

  // ── Start task ───────────────────────────────────────────────────────
  const startTask = useCallback(async (bookingId, note = '') => {
    setHelperError(null);
    try {
      const data = await helperApi.startTask(bookingId, note);
      setHelperBookings((prev) =>
        prev.map((b) => (b._id === data._id ? data : b)),
      );
      return data;
    } catch (error) {
      setHelperError(error.message);
      throw error;
    }
  }, []);

  // ── Mark arrived ─────────────────────────────────────────────────────
  const markArrived = useCallback(async (bookingId, note = '') => {
    setHelperError(null);
    try {
      const data = await helperApi.markArrived(bookingId, note);
      setHelperBookings((prev) =>
        prev.map((b) => (b._id === data._id ? data : b)),
      );
      return data;
    } catch (error) {
      setHelperError(error.message);
      throw error;
    }
  }, []);

  // ── Update booking status (complete) ─────────────────────────────────
  const updateBookingStatus = useCallback(async (bookingId, status, note = '') => {
    setHelperError(null);
    try {
      if (status === 'completed') {
        const data = await helperApi.completeTask(bookingId, note);
        setHelperBookings((prev) =>
          prev.map((b) => (b._id === data._id ? data : b)),
        );
        return data;
      } else if (status === 'in_progress') {
        const data = await helperApi.startTask(bookingId, note);
        setHelperBookings((prev) =>
          prev.map((b) => (b._id === data._id ? data : b)),
        );
        return data;
      }
      return null;
    } catch (error) {
      setHelperError(error.message);
      throw error;
    }
  }, []);

  // ── Load helper bookings ─────────────────────────────────────────────
  const loadHelperBookings = useCallback(async (query = {}) => {
    setHelperLoading(true);
    setHelperError(null);
    try {
      const data = await helperApi.getBookingHistory(query);
      setHelperBookings(data.bookings);
      return data;
    } catch (error) {
      setHelperError(error.message);
      return { bookings: [], total: 0 };
    } finally {
      setHelperLoading(false);
    }
  }, []);

  // ── Toggle availability ──────────────────────────────────────────────
  const toggleAvailability = useCallback(async (isAvailable) => {
    setHelperError(null);
    try {
      const data = await helperApi.toggleAvailability(isAvailable);
      setHelperAvailability(data);
      return data;
    } catch (error) {
      setHelperError(error.message);
      throw error;
    }
  }, []);

  // ── Load availability ────────────────────────────────────────────────
  const loadAvailability = useCallback(async () => {
    setHelperError(null);
    try {
      const data = await helperApi.getAvailability();
      setHelperAvailability(data);
      return data;
    } catch (error) {
      setHelperError(error.message);
      return null;
    }
  }, []);

  // ── Load schedule ────────────────────────────────────────────────────
  const loadSchedule = useCallback(async () => {
    setHelperError(null);
    try {
      const data = await helperApi.getSchedule();
      setHelperSchedule(data);
      return data;
    } catch (error) {
      setHelperError(error.message);
      return null;
    }
  }, []);

  // ── Update schedule ──────────────────────────────────────────────────
  const updateSchedule = useCallback(async (scheduleData) => {
    setHelperError(null);
    try {
      const data = await helperApi.updateSchedule(scheduleData);
      setHelperSchedule(data);
      return data;
    } catch (error) {
      setHelperError(error.message);
      throw error;
    }
  }, []);

  // ── Load service areas ───────────────────────────────────────────────
  const loadServiceAreas = useCallback(async () => {
    setHelperError(null);
    try {
      const data = await helperApi.getServiceAreas();
      setServiceAreas(data);
      return data;
    } catch (error) {
      setHelperError(error.message);
      return [];
    }
  }, []);

  // ── Add service area ─────────────────────────────────────────────────
  const addServiceArea = useCallback(async (areaData) => {
    setHelperError(null);
    try {
      const data = await helperApi.addServiceArea(areaData);
      setServiceAreas((prev) => [...prev, data]);
      return data;
    } catch (error) {
      setHelperError(error.message);
      throw error;
    }
  }, []);

  // ── Remove service area ──────────────────────────────────────────────
  const removeServiceArea = useCallback(async (areaId) => {
    setHelperError(null);
    try {
      await helperApi.removeServiceArea(areaId);
      setServiceAreas((prev) => prev.filter((a) => a._id !== areaId));
    } catch (error) {
      setHelperError(error.message);
      throw error;
    }
  }, []);

  // ── Load earnings ────────────────────────────────────────────────────
  const loadEarningsSummary = useCallback(async () => {
    setHelperError(null);
    try {
      const data = await helperApi.getEarningsSummary();
      setEarningsSummary(data);
      return data;
    } catch (error) {
      setHelperError(error.message);
      return null;
    }
  }, []);

  const loadEarningsHistory = useCallback(async (query = {}) => {
    setHelperError(null);
    try {
      const data = await helperApi.getEarningsHistory(query);
      return data;
    } catch (error) {
      setHelperError(error.message);
      return { transactions: [], total: 0 };
    }
  }, []);

  const switchMode = useCallback((m) => {
    setMode(m);
  }, []);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        switchMode,
        // State
        helperBookings,
        helperProfile,
        availableTasks,
        helperAvailability,
        helperSchedule,
        serviceAreas,
        earningsSummary,
        helperLoading,
        helperError,
        // Profile
        loadHelperProfile,
        updateHelperProfile,
        // Dashboard
        loadHelperDashboard,
        // Bookings
        loadHelperBookings,
        acceptHelperTask,
        rejectBooking,
        startTask,
        markArrived,
        updateBookingStatus,
        // Availability
        loadAvailability,
        toggleAvailability,
        // Schedule
        loadSchedule,
        updateSchedule,
        // Service Areas
        loadServiceAreas,
        addServiceArea,
        removeServiceArea,
        // Earnings
        loadEarningsSummary,
        loadEarningsHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

