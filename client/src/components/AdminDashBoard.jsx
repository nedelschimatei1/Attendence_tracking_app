import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-10">Admin Dashboard</h1>

      <div className=" grid grid-cols-3 gap-4 content-start">
        <Button onClick={() => navigate('/create-event-group')}>
          Create Event Group
        </Button>
        <Button onClick={() => navigate('/view-event-groups')}>
          View Event Groups
        </Button>
        <Button onClick={() => navigate('/view-participants')}>
          View Participants
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;