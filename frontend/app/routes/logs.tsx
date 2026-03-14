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
    <div className="p-4 md:p-8">
      <h1 className="text-3xl md:text-5xl font-bold text-gray-800">Presence Logs</h1>
      <p className="text-gray-600 mt-2">View detection history</p>
      
      <div className="mt-8">
        {logs.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm p-12 rounded-2xl shadow-lg border border-white/50 text-center">
            <p className="text-gray-500">No logs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log: any) => (
              <div key={log.id} className="bg-white/70 backdrop-blur-sm p-4 md:p-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                      <MdPerson className="text-xl md:text-2xl text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{log.person_name || `Person #${log.person_id}`}</h3>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-sm text-gray-600">
                        {log.camera_id && (
                          <span className="flex items-center gap-1">
                            <MdVideocam />
                            Camera: {log.camera_id}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MdAccessTime />
                          {formatDate(log.detected_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-semibold text-sm self-start sm:self-auto whitespace-nowrap">
                    {log.confidence_score}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
