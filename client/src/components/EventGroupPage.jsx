import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';

const API_BASE_URL = 'http://localhost:8080/api';

const EventGroupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventGroup, setEventGroup] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchEventGroup = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/eventGroups/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event group not found');
        }
        throw new Error('Failed to fetch event group');
      }

      const data = await response.json();
      setEventGroup(data);
    } catch (err) {
      console.error('Error fetching event group:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventGroup();
    const refreshInterval = setInterval(fetchEventGroup, 10000);
    
    return () => clearInterval(refreshInterval);
  }, [id]);

  const handleCheckIn = async (eventId) => {
    try {
      setError('');
      const token = localStorage.getItem('jwtToken');
      
      if (!accessCode.trim()) {
        setError('Please enter an access code');
        return;
      }
  
      const response = await fetch(`${API_BASE_URL}/participations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          accessCode: accessCode.trim().toUpperCase(),
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check in');
      }
      
      setSuccessMessage('Successfully checked in!');
      setAccessCode('');
      setSelectedEvent(null);
      fetchEventGroup();
      
      setTimeout(() => setSuccessMessage(''), 1000);
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="text-center">Loading event group...</div>
      </div>
    );
  }

  if (error && !eventGroup) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{eventGroup?.name || 'Event Group'}</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-4">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventGroup?.Events?.map((event) => (
            <div
              key={event.id}
              className={`
                bg-white rounded-lg shadow-md p-6
                ${event.state === 'CLOSED' ? 'opacity-75' : ''}
                transition-all duration-200
              `}
            >
              <h2 className="text-xl font-semibold mb-3">{event.name}</h2>
              <div className="space-y-2 mb-4">
                <p className="text-gray-600">
                  <span className="font-medium">Start Time:</span>{' '}
                  {new Date(event.startTime).toLocaleString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Duration:</span>{' '}
                  {event.duration} minutes
                </p>
                <p className={`font-medium ${
                  event.state === 'OPEN' ? 'text-green-600' : 'text-red-600'
                }`}>
                  Status: {event.state}
                </p>
              </div>

              {event.state === 'OPEN' && (
                <div className="space-y-3">
                  {selectedEvent?.id === event.id ? (
                    <>
                      <Input
                        type="text"
                        placeholder="Enter access code"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                        maxLength={4}
                        className="text-center uppercase"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleCheckIn(event.id)}
                          className="flex-1"
                        >
                          Check In
                        </Button>
                        <Button 
                          onClick={() => {
                            setSelectedEvent(null);
                            setAccessCode('');
                            setError('');
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button 
                      onClick={() => {
                        setSelectedEvent(event);
                        setError('');
                        setAccessCode('');
                      }}
                      className="w-full"
                    >
                      Enter Code
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {eventGroup?.Events?.length === 0 && (
          <div className="text-center text-gray-600 mt-8">
            No events available in this group.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventGroupPage;