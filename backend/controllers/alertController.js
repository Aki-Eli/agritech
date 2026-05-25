const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.createAlert = async (req, res) => {
  try {
    const alert = new Alert({ ...req.body, userId: req.user.id });
    await alert.save();
    res.json(alert);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ msg: 'Alert marked as read' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.markImplement = async (req, res) => {
  await Alert.findByIdAndUpdate(req.params.id, { implemented: true });
  res.json({ msg: 'Implemented' });
};

exports.reportPest = async (req, res) => {
  try {
    const { pestName, description, severity, preventiveMeasures, treatment } = req.body;

    // Save the alert only for the farmer who reported it
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
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};