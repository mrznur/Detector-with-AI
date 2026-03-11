import { Link, useLocation } from 'react-router';
import { MdDashboard, MdPeople, MdVideocam, MdHistory, MdFaceRetouchingNatural } from 'react-icons/md';

export default function Sidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: MdDashboard },
    { path: '/persons', label: 'Persons', icon: MdPeople },
    { path: '/cameras', label: 'Cameras', icon: MdVideocam },
    { path: '/verification', label: 'Verification', icon: MdFaceRetouchingNatural },
    { path: '/logs', label: 'Logs', icon: MdHistory },
  ];
  
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-6 fixed left-0 top-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white!">Detection</h2>
        <p className="text-sm text-gray-400">System</p>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive(item.path)
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="text-xl" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
