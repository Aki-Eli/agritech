const SupportTicket = require('../models/SupportTicket');

// Farmer: create a support ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ msg: 'Subject and message are required' });
    const ticket = new SupportTicket({ userId: req.user.id, subject, message });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Farmer: get own tickets
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
