import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

const ViewParticipations = () => {
  const [participations, setParticipations] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchParticipations = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`${API_BASE_URL}/participations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch participations');
      }

      const data = await response.json();
      setParticipations(data);
      setError(''); 
    } catch (err) {
      console.error('Error fetching participations:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipations();
    const intervalId = setInterval(fetchParticipations, 5000);
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading participations...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Participations</h1>
          {error && (
            <div className="text-red-500 text-sm">
              Error refreshing data: {error}
            </div>
          )}
        </div>

        {participations.length === 0 ? (
          <p className="text-gray-600">No participations recorded yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participations.map((participation) => (
                  <tr key={participation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {participation.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {participation.Event?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(participation.checkInTime).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500 text-right">
          Auto-refreshing every {5000 / 1000} seconds
        </div>
      </div>
    </div>
  );
};

export default ViewParticipations;