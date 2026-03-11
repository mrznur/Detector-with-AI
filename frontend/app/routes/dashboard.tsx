import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { MdPeople, MdVideocam } from 'react-icons/md';

export default function Dashboard() {
  const [personCount, setPersonCount] = useState(0);
  const [cameraCount, setCameraCount] = useState(0);

  useEffect(() => {
    api.get('/persons')
      .then(data => setPersonCount(data.length))
      .catch(err => console.error('Error fetching persons:', err));

    api.get('/cameras')
      .then(data => setCameraCount(data.length))
      .catch(err => console.error('Error fetching cameras:', err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-5xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-600 mt-2">Welcome to the Detection System</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <MdPeople className="text-2xl text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Persons</h3>
              <h2 className="text-4xl font-bold text-gray-800 mt-1">{personCount}</h2>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <MdVideocam className="text-2xl text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Cameras</h3>
              <h2 className="text-4xl font-bold text-gray-800 mt-1">{cameraCount}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
