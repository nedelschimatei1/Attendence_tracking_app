import express from 'express';
import { nanoid } from 'nanoid';
import Event from '../models/Event.js';
import verifyToken from '../middleware/authMiddleware.js';

const eventRoutes = express.Router();

eventRoutes.post('/', verifyToken, async (req, res) => {
  try {
    const { name, startTime, duration, groupId } = req.body;

    // Generate a unique access code
    const accessCode = nanoid(4).toUpperCase();

    const event = await Event.create({
      name,
      startTime,
      duration,
      accessCode,
      groupId,
    });

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

eventRoutes.get('/', verifyToken, async (req, res) => {
  try {
    const events = await Event.findAll();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

eventRoutes.get('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

eventRoutes.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, startTime, duration, groupId } = req.body;
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.name = name || event.name;
    event.startTime = startTime || event.startTime;
    event.duration = duration || event.duration;
    event.groupId = groupId || event.groupId;

    await event.save();

    res.status(200).json({
      message: 'Event updated successfully',
      event,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

eventRoutes.delete('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await event.destroy();
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default eventRoutes;
