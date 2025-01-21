import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';

const API_BASE_URL = 'http://localhost:8080/api';

const CreateEventGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [events, setEvents] = useState([{ name: '', startTime: '', duration: '' }]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createdEvents, setCreatedEvents] = useState([]);
  const navigate = useNavigate();

  const handleAddEvent = () => {
    setEvents([...events, { name: '', startTime: '', duration: '' }]);
  };

  const handleEventChange = (index, field, value) => {
    const updatedEvents = events.map((event, i) => {
      if (i === index) {
        return { ...event, [field]: value };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setCreatedEvents([]);

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError('No token found. Please log in again.');
        navigate('/');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/eventGroups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: groupName, events })
      });

      if (!response.ok) throw new Error('Failed to add event group');

      const data = await response.json();
      console.log('Response data:', data);

      setSuccessMessage('Event group created successfully!');
      if (data.Events) {
        setCreatedEvents(data.Events);
      } else if (data.eventGroup && data.eventGroup.Events) {
        setCreatedEvents(data.eventGroup.Events);
      } else if (Array.isArray(data.events)) {
        setCreatedEvents(data.events);
      } else {
        console.warn('Unexpected response structure:', data);
        setCreatedEvents([]);
      }

      setGroupName('');
      setEvents([{ name: '', startTime: '', duration: '' }]);
    } catch (err) {
      console.error('Error creating event group:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Create Event Group</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-4">
          <div className="mb-2">{successMessage}</div>
          {createdEvents.length > 0 && (
            <>
              <div className="font-semibold">Event Access Codes:</div>
              <ul className="list-disc pl-5">
                {createdEvents.map((event) => (
                  <li key={event.id}>
                    {event.name}: <span className="font-mono font-bold">{event.accessCode}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />

        {events.map((event, index) => (
          <div key={index} className="space-y-2 border p-4 rounded bg-white">
            <Input
              placeholder="Event Name"
              value={event.name}
              onChange={(e) => handleEventChange(index, 'name', e.target.value)}
              required
            />
            <Input
              type="datetime-local"
              value={event.startTime}
              onChange={(e) => handleEventChange(index, 'startTime', e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Duration (minutes)"
              value={event.duration}
              onChange={(e) => handleEventChange(index, 'duration', e.target.value)}
              required
            />
          </div>
        ))}

        <div className="flex gap-4">
          <Button type="button" onClick={handleAddEvent} variant="outline">
            Add Another Event
          </Button>

          <Button type="submit">Submit Event Group</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventGroup;