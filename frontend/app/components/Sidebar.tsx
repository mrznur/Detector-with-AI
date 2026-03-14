import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { MdDashboard, MdPeople, MdVideocam, MdHistory, MdFaceRetouchingNatural, MdMenu, MdClose } from 'react-icons/md';

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: MdDashboard },
    { path: '/persons', label: 'Persons', icon: MdPeople },
    { path: '/cameras', label: 'Cameras', icon: MdVideocam },
    { path: '/verification', label: 'Verification', icon: MdFaceRetouchingNatural },
    { path: '/logs', label: 'Logs', icon: MdHistory },
  ];

  const NavLinks = () => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive(item.path)
                ? 'bg-emerald-500 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Icon className="text-xl shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-xl font-bold">Detection</h2>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-gray-700">
          {open ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-64 z-50 bg-gray-800 text-white p-6 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="mb-8 mt-2">
          <h2 className="text-3xl font-bold text-white">Detection</h2>
          <p className="text-sm text-gray-400">System</p>
        </div>
        <NavLinks />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 h-screen bg-gray-800 text-white p-6 fixed left-0 top-0 flex-col">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Detection</h2>
          <p className="text-sm text-gray-400">System</p>
        </div>
        <NavLinks />
      </div>
    </>
  );
}
