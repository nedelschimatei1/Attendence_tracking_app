import React, { useEffect, useState } from 'react';
const API_BASE_URL = 'http://localhost:8080/api';

const ViewEventGroups = () => {
  const [eventGroups, setEventGroups] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [participantCounts, setParticipantCounts] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [eventParticipants, setEventParticipants] = useState({});
  const [users, setUsers] = useState({});

  const downloadGroupParticipantsCSV = async (group) => {
    try {
      const allParticipations = [];
      console.log('Starting download for group:', group.name);
      console.log('Events in group:', group.Events.length);
  
      const token = localStorage.getItem('jwtToken');
      const participationsResponse = await fetch(`${API_BASE_URL}/participations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!participationsResponse.ok) {
        throw new Error('Failed to fetch participations');
      }
  
      const allParticipationsData = await participationsResponse.json();
      console.log('Total participations fetched:', allParticipationsData.length);
  
      const groupEventIds = group.Events.map(event => event.id);
      const groupParticipations = allParticipationsData.filter(p => 
        groupEventIds.includes(p.eventId)
      );
  
      console.log('Participations for this group:', groupParticipations.length);
  
      if (groupParticipations.length === 0) {
        alert('No participants to export in this group');
        return;
      }
  
      const userIds = [...new Set(groupParticipations.map(p => p.userId))];
      console.log('Unique users to fetch:', userIds.length);
  
      const usersPromises = userIds.map(userId => 
        fetch(`${API_BASE_URL}/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
      );
  
      const usersData = await Promise.all(usersPromises);
      const usersMap = {};
      usersData.forEach(user => {
        if (user && user.id) {
          usersMap[user.id] = user.username;
        }
      });
  
      const csvRows = [
        ['Event Name', 'User ID', 'Username', 'Check-in Time'],
        ...groupParticipations.map(participant => [
          group.Events.find(e => e.id === participant.eventId)?.name || 'Unknown Event',
          participant.userId,
          usersMap[participant.userId] || 'Unknown User',
          new Date(participant.checkInTime).toLocaleString()
        ])
      ];
  
      const csvContent = csvRows
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
  
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `group_participants_${group.name}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
    } catch (err) {
      console.error('Error downloading group CSV:', err);
      console.error('Error details:', err.stack);
      alert('Failed to download group participants list');
    }
  };

  const downloadParticipantsCSV = async (eventId, eventName) => {
    try {
      console.log('Starting download for event:', eventName);
      
      const token = localStorage.getItem('jwtToken');
      const participationsResponse = await fetch(`${API_BASE_URL}/participations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!participationsResponse.ok) {
        throw new Error('Failed to fetch participations');
      }
  
      const allParticipations = await participationsResponse.json();
      console.log('Total participations fetched:', allParticipations.length);
  
      const eventParticipations = allParticipations.filter(p => p.eventId === eventId);
      console.log('Participations for this event:', eventParticipations.length);
  
      if (eventParticipations.length === 0) {
        alert('No participants to export for this event');
        return;
      }
  
      const userIds = [...new Set(eventParticipations.map(p => p.userId))];
      console.log('Unique users to fetch:', userIds.length);
  
      const usersPromises = userIds.map(userId => 
        fetch(`${API_BASE_URL}/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
      );
  
      const usersData = await Promise.all(usersPromises);
      const usersMap = {};
      usersData.forEach(user => {
        if (user && user.id) {
          usersMap[user.id] = user.username;
        }
      });
  
      const csvRows = [
        ['User ID', 'Username', 'Check-in Time'],
        ...eventParticipations.map(participant => [
          participant.userId,
          usersMap[participant.userId] || 'Unknown User',
          new Date(participant.checkInTime).toLocaleString()
        ])
      ];
  
      console.log('Preparing CSV with rows:', csvRows.length);
  
      const csvContent = csvRows
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
  
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `participants_${eventName}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
  
      console.log('Download completed successfully');
    } catch (err) {
      console.error('Error downloading event CSV:', err);
      console.error('Error details:', err.stack);
      alert('Failed to download participants list');
    }
  };

  const fetchEventParticipants = async (eventId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const participationsResponse = await fetch(`${API_BASE_URL}/participations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!participationsResponse.ok) {
        throw new Error('Failed to fetch participations');
      }
  
      const allParticipations = await participationsResponse.json();
      const eventParticipations = allParticipations.filter(p => p.eventId === eventId);
      
      const userIds = [...new Set(eventParticipations.map(p => p.userId))];
      
      const usersPromises = userIds.map(userId => 
        fetch(`${API_BASE_URL}/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
      );

      const usersData = await Promise.all(usersPromises);
      const usersMap = {};
      usersData.forEach(user => {
        if (user && user.id) {
          usersMap[user.id] = user.username;
        }
      });

      setUsers(prevUsers => ({
        ...prevUsers,
        ...usersMap
      }));
      
      setEventParticipants(prev => ({
        ...prev,
        [eventId]: eventParticipations
      }));
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Failed to fetch participants');
    }
  };

  const fetchParticipantCounts = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`${API_BASE_URL}/participations/counts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch participant counts');
      }

      const data = await response.json();
      if (data.success) {
        setParticipantCounts(data);
      }
    } catch (err) {
      console.error('Error fetching participant counts:', err);
    }
  };

  const fetchEventGroups = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`${API_BASE_URL}/eventGroups`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch event groups');
      const data = await response.json();
      setEventGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventGroups();
    fetchParticipantCounts();
  
    const intervalId = setInterval(() => {
      fetchEventGroups();
      fetchParticipantCounts();
      if (expandedEventId) {
        fetchEventParticipants(expandedEventId);
      }
    }, 5000);
  
    return () => clearInterval(intervalId);
  }, [expandedEventId]);

  const getEventParticipantCount = (eventId) => {
    return participantCounts?.counts?.events?.[eventId] || 0;
  };

  const getGroupParticipantCount = (groupId) => {
    return participantCounts?.counts?.groups?.[groupId] || 0;
  };

  const handleToggleParticipants = async (eventId) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
    } else {
      setExpandedEventId(eventId);
      await fetchEventParticipants(eventId);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading event groups...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">View Event Groups</h1>
      
      {eventGroups.length === 0 ? (
        <p className="text-gray-500">No event groups available.</p>
      ) : (
        <div className="space-y-6">
          {eventGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{group.name}</h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Total Participants: {getGroupParticipantCount(group.id)}
                </span>
                <p 
                  onClick={() => downloadGroupParticipantsCSV(group)}
                  className="text-green-600 hover:text-green-800 cursor-pointer underline text-sm"
                >
                  Download Group CSV
                </p>
              </div>

              {group.Events && group.Events.length > 0 ? (
                <div className="space-y-4">
                  {group.Events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{event.name}</h3>
                          <p className="text-sm text-gray-600">
                            Start: {new Date(event.startTime).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duration: {event.duration} minutes
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            event.state === 'OPEN' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {event.state}
                          </span>
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-sm">
                            Participants: {getEventParticipantCount(event.id)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-2">
                        <p 
                          onClick={() => handleToggleParticipants(event.id)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer underline text-sm"
                        >
                          {expandedEventId === event.id ? 'Hide participant list' : 'Click to see the list of users'}
                        </p>
                        
                        <p 
                          onClick={() => downloadParticipantsCSV(event.id, event.name)}
                          className="text-green-600 hover:text-green-800 cursor-pointer underline text-sm"
                        >
                          Download CSV
                        </p>
                      </div>

                      {expandedEventId === event.id && (
                        <div className="mt-3 border-t pt-3">
                          {eventParticipants[event.id] ? (
                            eventParticipants[event.id].length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User ID
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Check-in Time
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {eventParticipants[event.id].map((participant) => (
                                      <tr key={participant.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                          {participant.userId}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                                          {users[participant.userId] || 'Loading...'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                          {new Date(participant.checkInTime).toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-2">No participants yet</p>
                            )
                          ) : (
                            <p className="text-gray-500 text-center py-2">Loading participants...</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No events in this group.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewEventGroups;