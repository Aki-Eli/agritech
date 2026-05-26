/**
 * Alert controller.
 * Manages pest/disease alerts for the authenticated farmer.
 */
const Alert = require('../models/Alert');

/**
 * GET /api/alerts
 * Returns all alerts for the authenticated user, newest first.
 */
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json(alerts);
  } catch (err) {
    console.error('getAlerts error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * POST /api/alerts
 * Creates a new alert for the authenticated user.
 */
exports.createAlert = async (req, res) => {
  try {
    const alert = new Alert({ ...req.body, userId: req.user.id });
    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    console.error('createAlert error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/alerts/:id/read
 * Marks an alert as read.
 */
exports.markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ msg: 'Alert not found' });
    res.json({ msg: 'Alert marked as read' });
  } catch (err) {
    console.error('markAsRead error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * PUT /api/alerts/:id/implement
 * Marks an alert as implemented (farmer has acted on it).
 */
exports.markImplement = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { implemented: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ msg: 'Alert not found' });
    res.json({ msg: 'Alert marked as implemented' });
  } catch (err) {
    console.error('markImplement error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * POST /api/alerts/report
 * Farmer reports a pest sighting — saves an alert for their own account.
 */
exports.reportPest = async (req, res) => {
  try {
    const { pestName, description, severity, preventiveMeasures, treatment } = req.body;
    if (!pestName || !description) {
      return res.status(400).json({ msg: 'pestName and description are required' });
    }

    const alert = new Alert({
      userId: req.user.id,
      type: pestName,
      message: description,
      severity: severity || 'medium',
      preventiveMeasures: preventiveMeasures || 'Regular scouting, crop rotation, remove infected plants.',
      treatment: treatment || 'Apply recommended pesticide or organic solution.',
      isRead: false,
      implemented: false,
    });

    await alert.save();
    res.status(201).json({ msg: 'Pest alert saved to your alerts.' });
  } catch (err) {
    console.error('reportPest error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
