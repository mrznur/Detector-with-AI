import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { MdAdd, MdClose, MdCameraAlt, MdDelete } from 'react-icons/md';
import ConfirmModal from '../components/ConfirmModal';

export default function Persons() {
  const [persons, setPersons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [enrollingPersonId, setEnrollingPersonId] = useState<number | null>(null);
  const [enrollFile, setEnrollFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; personId: number | null; personName: string }>({
    show: false,
    personId: null,
    personName: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    employee_id: ''
  });

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = () => {
    api.get('/persons')
      .then(data => setPersons(data))
      .catch(err => console.error('Error:', err));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSend: any = { name: formData.name };
    if (formData.age) dataToSend.age = parseInt(formData.age);
    if (formData.gender) dataToSend.gender = formData.gender;
    if (formData.employee_id) dataToSend.employee_id = formData.employee_id;
    
    console.log('Sending data:', dataToSend);
    
    api.post('/persons', dataToSend)
      .then((response) => {
        console.log('Success:', response);
        loadPersons();
        setShowForm(false);
        setFormData({ name: '', age: '', gender: '', employee_id: '' });
      })
      .catch(err => {
        console.error('Error creating person:', err);
        alert('Failed to create person. Check console for details.');
      });
  };

  const handleEnrollFace = async (personId: number) => {
    if (!enrollFile) {
      alert('Please select a file first');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', enrollFile);
    
    console.log('Uploading face for person:', personId);
    console.log('File:', enrollFile.name, enrollFile.type, enrollFile.size);
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/faces/enroll/${personId}`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (response.ok) {
        alert(`Face enrolled successfully for ${data.person_name}!`);
        setEnrollingPersonId(null);
        setEnrollFile(null);
      } else {
        console.error('Error response:', data);
        alert(`Failed to enroll face: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error enrolling face:', error);
      alert('Error enrolling face. Make sure the backend is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePerson = async (personId: number, personName: string) => {
    setDeleteModal({ show: true, personId, personName });
  };

  const confirmDelete = async () => {
    if (!deleteModal.personId) return;
    
    try {
      await api.delete(`/persons/${deleteModal.personId}`);
      console.log('Person deleted successfully');
      loadPersons();
      setDeleteModal({ show: false, personId: null, personName: '' });
    } catch (error) {
      console.error('Error deleting person:', error);
      alert('Failed to delete person');
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, personId: null, personName: '' });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">Persons</h1>
          <p className="text-gray-600 mt-1">Manage registered persons</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition shadow-lg"
        >
          {showForm ? <MdClose className="text-xl" /> : <MdAdd className="text-xl" />}
          {showForm ? 'Cancel' : 'Add Person'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input 
                type="number"
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Enter age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
              <input 
                type="text"
                value={formData.employee_id}
                onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Optional"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition shadow-lg"
          >
            Create Person
          </button>
        </form>
      )}
      
      <div className="mt-6">
        {persons.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No persons found</p>
        ) : (
          <div className="space-y-3">
            {persons.map((person: any) => (
              <div key={person.id} className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{person.name}</h3>
                    <div className="flex gap-3 mt-2 text-sm text-gray-600">
                      {person.age && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">Age: {person.age}</span>}
                      {person.gender && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg">{person.gender}</span>}
                      {person.employee_id && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg">ID: {person.employee_id}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEnrollingPersonId(person.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"
                    >
                      <MdCameraAlt />
                      Enroll Face
                    </button>
                    <button
                      onClick={() => handleDeletePerson(person.id, person.name)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                    >
                      <MdDelete />
                      Delete
                    </button>
                  </div>
                </div>
                
                {enrollingPersonId === person.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select face photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setEnrollFile(file);
                        console.log('File selected:', file?.name);
                      }}
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none mb-3 p-2"
                    />
                    {enrollFile && (
                      <p className="text-sm text-gray-600 mb-3">
                        Selected: {enrollFile.name} ({(enrollFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEnrollFace(person.id)}
                        disabled={!enrollFile || uploading}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                      <button
                        onClick={() => {
                          setEnrollingPersonId(null);
                          setEnrollFile(null);
                        }}
                        disabled={uploading}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.show}
        title="Delete Person"
        message={`Are you sure you want to delete ${deleteModal.personName}? This will permanently delete all their face data and presence logs. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="danger"
      />
    </div>
  );
}
