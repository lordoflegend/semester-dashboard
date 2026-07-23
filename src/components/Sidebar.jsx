import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ClipboardList, Settings } from 'lucide-react';
import SettingsModal from './SettingsModal';

export default function Sidebar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <BookOpen size={28} />
        <span>SemesterApp</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Courses</span>
        </NavLink>
        <NavLink to="/assignments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <ClipboardList size={20} />
          <span>Assignments</span>
        </NavLink>
      </div>

      <div className="nav-links" style={{ marginTop: 'auto', paddingBottom: '1rem' }}>
        <button 
          className="nav-link" 
          style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontFamily: 'inherit' }} 
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings size={20} />
          <span>Backup & Restore</span>
        </button>
      </div>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}
