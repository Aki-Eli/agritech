/**
 * Support controller.
 * Allows farmers to submit and view their own support tickets.
 * Admin responses are handled in adminController.
 */
const SupportTicket = require('../models/SupportTicket');

/**
 * POST /api/support
 * Creates a new support ticket for the authenticated user.
 */
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ msg: 'Subject and message are required' });
    }
    const ticket = new SupportTicket({ userId: req.user.id, subject, message });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    console.error('createTicket error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * GET /api/support/me
 * Returns all support tickets submitted by the authenticated user, newest first.
 */
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(tickets);
  } catch (err) {
    console.error('getMyTickets error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
