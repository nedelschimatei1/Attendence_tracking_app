import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

const Login = ({ setUser }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({ username: '', password: '', role: 'participant' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = activeTab === 'register' ? 'register' : 'login';
      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      if (activeTab === 'login') {
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('userRole', data.role);
        setUser({ role: data.role });
        if (data.role === 'eventOrganizer') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setActiveTab('login');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Event Management System</h2>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="login">
              <LogIn className="w-4 h-4 mr-2" /> Login
            </TabsTrigger>
            <TabsTrigger value="register">
              <UserPlus className="w-4 h-4 mr-2" /> Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form className="space-y-4"onSubmit={handleSubmit}>
              <Input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <select
                name="role"
                className="w-full p-2 border rounded mb-4"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="participant">Participant</option>
                <option value="eventOrganizer">Event Organizer</option>
              </select>
              <Button type="submit" className="w-full">Register</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
