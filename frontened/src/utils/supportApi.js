/**
 * Support Ticket API client.
 */
import api from './apiClient.js';

/**
 * Create a new support ticket.
 * @param {Object} data - { subject, description, category?, bookingId?, priority? }
 * @returns {Promise<Object>} Created ticket
 */
export async function createTicket(data) {
  const response = await api.post('/support/tickets', data);
  return response.data;
}

/**
 * Get all tickets for the current user.
 * @param {Object} query - { status, limit, skip }
 * @returns {Promise<{tickets, total}>}
 */
export async function getMyTickets(query = {}) {
  const params = new URLSearchParams(query).toString();
  const response = await api.get(`/support/tickets${params ? `?${params}` : ''}`);
  return response.data;
}

/**
 * Get a single ticket by ID.
 * @param {string} ticketId - MongoDB _id or human-readable TKT-xxx
 * @returns {Promise<Object>}
 */
export async function getTicketById(ticketId) {
  const response = await api.get(`/support/tickets/${ticketId}`);
  return response.data;
}

/**
 * Add a reply to a ticket.
 * @param {string} ticketId
 * @param {string} content
 * @returns {Promise<Object>}
 */
export async function replyToTicket(ticketId, content) {
  const response = await api.post(`/support/tickets/${ticketId}/reply`, { content });
  return response.data;
}

/**
 * Close a support ticket.
 * @param {string} ticketId
 * @returns {Promise<Object>}
 */
export async function closeTicket(ticketId) {
  const response = await api.patch(`/support/tickets/${ticketId}/close`);
  return response.data;
}

export default {
  createTicket,
  getMyTickets,
  getTicketById,
  replyToTicket,
  closeTicket,
};
