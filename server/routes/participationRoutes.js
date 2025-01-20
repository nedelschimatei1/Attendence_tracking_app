import express from 'express';
import Participation from '../models/Participation.js';
import Event from '../models/Event.js';
import verifyToken from '../middleware/authMiddleware.js';
import sequelize from '../database/database.js';

const participationRoutes = express.Router();

participationRoutes.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Received participation request:', req.body);
    console.log('User from token:', req.user);

    const { eventId, accessCode } = req.body;
    
    if (!eventId || !accessCode) {
      return res.status(400).json({ 
        error: 'Event ID and access code are required' 
      });
    }

    const event = await Event.findByPk(eventId);
    console.log('Found event:', event);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log('Event state:', event.state);
    if (event.state !== 'OPEN') {
      return res.status(400).json({ error: 'Event is not open for check-in' });
    }

    console.log('Comparing access codes:', {
      provided: accessCode.trim().toUpperCase(),
      actual: event.accessCode
    });
    
    if (event.accessCode !== accessCode.trim().toUpperCase()) {
      return res.status(400).json({ error: 'Invalid access code' });
    }

    const existingParticipation = await Participation.findOne({
      where: {
        userId: req.user.userId,
        eventId: eventId
      }
    });

    console.log('Existing participation:', existingParticipation);

    if (existingParticipation) {
      return res.status(400).json({ 
        error: 'You have already checked in to this event' 
      });
    }

    const participation = await Participation.create({
      userId: req.user.userId,
      eventId: eventId,
      checkInTime: new Date()
    });

    console.log('Created participation:', participation);

    res.status(201).json({
      message: 'Successfully checked in',
      participation
    });

  } catch (err) {
    console.error('Detailed error during check-in:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      error: 'Failed to check in to event',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

participationRoutes.get('/', verifyToken, async (req, res) => {
  try {
    const participations = await Participation.findAll({
      include: [{
        model: Event,
        attributes: ['name', 'startTime', 'duration', 'state']
      }],
      order: [[Event, 'startTime', 'DESC']]
    });

    res.status(200).json(participations);
  } catch (err) {
    console.error('Error fetching participations:', err);
    res.status(500).json({ error: 'Failed to fetch participations' });
  }
});

participationRoutes.get('/counts', verifyToken, async (req, res) => {
  try {
    const eventCounts = await Participation.findAll({
      attributes: [
        'eventId',
        [sequelize.fn('COUNT', sequelize.col('Participation.id')), 'participantCount']
      ],
      include: [{
        model: Event,
        attributes: ['groupId'],
        required: true
      }],
      group: ['eventId', 'Event.id', 'Event.groupId'],
      raw: true
    });

    const counts = {
      events: {},
      groups: {}
    };

    eventCounts.forEach(count => {
      counts.events[count.eventId] = parseInt(count.participantCount);
      
      const groupId = count['Event.groupId'];
      if (!counts.groups[groupId]) {
        counts.groups[groupId] = 0;
      }
      counts.groups[groupId] += parseInt(count.participantCount);
    });

    res.json({
      success: true,
      counts: counts
    });

  } catch (error) {
    console.error('Error getting participation counts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get participation counts' 
    });
  }
});


participationRoutes.get('/:id', verifyToken, async (req, res) => {
  try {
    const participation = await Participation.findOne({
      where: {
        id: req.params.id,
      },
      include: [{
        model: Event,
        attributes: ['name', 'startTime', 'duration', 'state']
      }]
    });

    if (!participation) {
      return res.status(404).json({ error: 'Participation not found' });
    }

    res.status(200).json(participation);
  } catch (err) {
    console.error('Error fetching participation:', err);
    res.status(500).json({ error: 'Failed to fetch participation' });
  }
});

participationRoutes.put('/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['CHECKED_OUT', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const participation = await Participation.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      include: [Event]
    });

    if (!participation) {
      return res.status(404).json({ error: 'Participation not found' });
    }

    if (participation.status !== 'CHECKED_IN') {
      return res.status(400).json({ error: 'Can only update active check-ins' });
    }

    participation.status = status;
    await participation.save();

    res.status(200).json({
      message: `Successfully ${status.toLowerCase().replace('_', ' ')}`,
      participation
    });
  } catch (err) {
    console.error('Error updating participation:', err);
    res.status(500).json({ error: 'Failed to update participation' });
  }
});


participationRoutes.delete('/:id', verifyToken, async (req, res) => {
  try {
    const participation = await Participation.findByPk(req.params.id);

    if (!participation) {
      return res.status(404).json({ error: 'Participation not found' });
    }

    if (req.user.role !== 'eventOrganizer') {
      return res.status(403).json({ error: 'Not authorized to delete participations' });
    }

    await participation.destroy();
    res.status(200).json({ message: 'Participation deleted successfully' });
  } catch (err) {
    console.error('Error deleting participation:', err);
    res.status(500).json({ error: 'Failed to delete participation' });
  }
});

participationRoutes.get('/event/:eventId', verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({
      where: { id: eventId },
      include: [{
        model: EventGroup,
        where: { organizerId: req.user.userId }
      }]
    });

    if (!event) {
      return res.status(403).json({ error: 'Not authorized to view these participations' });
    }

    const participations = await Participation.findAll({
      where: { eventId },
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }],
      order: [['checkInTime', 'DESC']]
    });

    res.status(200).json(participations);
  } catch (err) {
    console.error('Error fetching event participations:', err);
    res.status(500).json({ error: 'Failed to fetch event participations' });
  }
});

export default participationRoutes;