import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { MdPerson, MdVideocam, MdAccessTime } from 'react-icons/md';

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    api.get('/logs')
      .then(data => setLogs(data))
      .catch(err => console.error('Error:', err));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-8">
      <h1 className="text-5xl font-bold text-gray-800">Presence Logs</h1>
      <p className="text-gray-600 mt-2">View detection history</p>
      
      <div className="mt-8">
        {logs.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm p-12 rounded-2xl shadow-lg border border-white/50 text-center">
            <p className="text-gray-500">No logs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log: any) => (
              <div key={log.id} className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <MdPerson className="text-2xl text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Person ID: {log.person_id}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MdVideocam />
                          Camera ID: {log.camera_id}
                        </span>
                        <span className="flex items-center gap-1">
                          <MdAccessTime />
                          {formatDate(log.detected_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-semibold">
                      {log.confidence_score}% confidence
                    </span>
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
