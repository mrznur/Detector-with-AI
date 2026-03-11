import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { MdAdd, MdClose } from 'react-icons/md';

export default function Cameras() {
  const [cameras, setCameras] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    stream_url: '',
    camera_type: 'ip_camera',
    fps: 30,
    resolution: '1920x1080'
  });

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = () => {
    api.get('/cameras')
      .then(data => setCameras(data))
      .catch(err => console.error('Error:', err));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSend: any = {
      name: formData.name,
      location: formData.location,
      stream_url: formData.stream_url,
      camera_type: formData.camera_type,
      fps: formData.fps,
      resolution: formData.resolution
    };
    
    api.post('/cameras', dataToSend)
      .then(() => {
        loadCameras();
        setShowForm(false);
        setFormData({ name: '', location: '', stream_url: '', camera_type: 'ip_camera', fps: 30, resolution: '1920x1080' });
      })
      .catch(err => console.error('Error:', err));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">Cameras</h1>
          <p className="text-gray-600 mt-1">Manage surveillance cameras</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition shadow-lg"
        >
          {showForm ? <MdClose className="text-xl" /> : <MdAdd className="text-xl" />}
          {showForm ? 'Cancel' : 'Add Camera'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Camera Name *</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input 
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stream URL *</label>
              <input 
                type="text"
                required
                value={formData.stream_url}
                onChange={(e) => setFormData({...formData, stream_url: e.target.value})}
                placeholder="rtsp://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Camera Type</label>
              <select
                value={formData.camera_type}
                onChange={(e) => setFormData({...formData, camera_type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50"
              >
                <option value="ip_camera">IP Camera</option>
                <option value="phone">Phone</option>
                <option value="webcam">Webcam</option>
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition shadow-lg"
          >
            Create Camera
          </button>
        </form>
      )}
      
      <div className="mt-6">
        {cameras.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No cameras found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cameras.map((camera: any) => (
              <div key={camera.id} className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{camera.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{camera.location}</p>
                    <div className="flex gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-lg text-xs ${camera.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {camera.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs">{camera.camera_type}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
