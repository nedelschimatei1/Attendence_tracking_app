import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const API_BASE_URL = 'http://localhost:8080/api';

const Dashboard = () => {
  const [eventGroups, setEventGroups] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEventGroups();
  }, []);

  const fetchEventGroups = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`${API_BASE_URL}/eventGroups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch event groups');
      const data = await response.json();
      setEventGroups(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome to Your Events Dashboard</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {group.Events?.length || 0} Events Available
              </p>
              <Button 
                onClick={() => navigate(`/eventgroup/${group.id}`)}
                className="w-full"
              >
                View Events
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {eventGroups.length === 0 && !error && (
        <p className="text-center text-gray-600 mt-8">
          No event groups available at the moment.
        </p>
      )}
    </div>
  );
};

export default Dashboard;