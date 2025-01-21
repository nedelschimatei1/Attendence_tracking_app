// routes/eventGroupRoutes.js
import express from 'express';
import EventGroup from '../models/EventGroup.js';
import Event from '../models/Event.js';
import { nanoid } from 'nanoid';
import verifyToken from '../middleware/authMiddleware.js';
import sequelize from '../database/database.js';

const eventGroupRoutes = express.Router();

eventGroupRoutes.post('/', verifyToken, async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { name, events } = req.body;

    if (!req.user || !req.user.userId) {
      throw new Error('User not authenticated');
    }

    const eventGroup = await EventGroup.create({
      name,
      organizerId: req.user.userId
    }, { transaction: t });

    // Create events
    await Promise.all(
      events.map(async (event) => {
        await Event.create({
          name: event.name,
          startTime: new Date(event.startTime),
          duration: parseInt(event.duration),
          accessCode: nanoid(4).toUpperCase(),
          groupId: eventGroup.id,
          state: 'CLOSED'
        }, { transaction: t });
      })
    );

    await t.commit();

    const completeGroup = await EventGroup.findOne({
      where: { id: eventGroup.id },
      include: [Event]
    });

    res.status(201).json(completeGroup);

  } catch (err) {
    console.error('Error creating event group:', err);
    await t.rollback();
    res.status(500).json({ error: 'Failed to create event group: ' + err.message });
  }
});

eventGroupRoutes.get('/', verifyToken, async (req, res) => {
  try {
    // If user is an event organizer, show only their groups
    if (req.user.role === 'eventOrganizer') {
      const eventGroups = await EventGroup.findAll({
        where: { organizerId: req.user.userId },
        include: [{
          model: Event,
          order: [['startTime', 'ASC']]
        }],
      });
      return res.status(200).json(eventGroups);
    }

    const eventGroups = await EventGroup.findAll({
      include: [{
        model: Event,
        order: [['startTime', 'ASC']]
      }],
    });

    res.status(200).json(eventGroups);
  } catch (err) {
    console.error('Error fetching event groups:', err);
    res.status(500).json({ error: 'Failed to fetch event groups' });
  }
});

eventGroupRoutes.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const eventGroup = await EventGroup.findOne({ where: { id, organizerId: req.user.userId } });
    if (!eventGroup) {
      return res.status(404).json({ error: 'Event group not found' });
    }

    eventGroup.name = name || eventGroup.name;
    await eventGroup.save();

    res.status(200).json({ message: 'Event group updated successfully', eventGroup });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event group' });
  }
});

eventGroupRoutes.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const eventGroup = await EventGroup.findOne({
      where: { id },
      include: [{
        model: Event,
        order: [['startTime', 'ASC']]
      }],
    });

    if (!eventGroup) {
      return res.status(404).json({ error: 'Event group not found' });
    }

    res.status(200).json(eventGroup);
  } catch (err) {
    console.error('Error fetching event group:', err);
    res.status(500).json({ error: 'Failed to fetch event group' });
  }
});

eventGroupRoutes.delete('/', verifyToken, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // If user is an event organizer, only delete their groups
    const whereClause = req.user.role === 'eventOrganizer' 
      ? { organizerId: req.user.userId }
      : {};

    const eventGroups = await EventGroup.findAll({
      where: whereClause,
      transaction: t
    });

    if (eventGroups.length === 0) {
      return res.status(404).json({ error: 'No event groups found' });
    }

    // Get all event group IDs
    const groupIds = eventGroups.map(group => group.id);

    await Event.destroy({
      where: { groupId: groupIds },
      transaction: transaction
    });

    await EventGroup.destroy({
      where: whereClause,
      transaction: transaction
    });

    await transaction.commit();
    res.status(200).json({ 
      message: `Successfully deleted ${eventGroups.length} event groups and their events`
    });

  } catch (err) {
    await transaction.rollback();
    console.error('Error deleting all event groups:', err);
    res.status(500).json({ error: 'Failed to delete event groups' });
  }
});

eventGroupRoutes.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const eventGroup = await EventGroup.findOne({ where: { id, organizerId: req.user.userId } });
    if (!eventGroup) {
      return res.status(404).json({ error: 'Event group not found' });
    }

    // Delete the associated events
    await Event.destroy({ where: { groupId: eventGroup.id } });

    // Delete the event group
    await eventGroup.destroy();

    res.status(200).json({ message: 'Event group deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event group' });
  }
});

export default eventGroupRoutes;
