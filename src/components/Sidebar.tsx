import React from 'react';
import './Sidebar.css';
import DriveStatLogo from './DriveStatLogo';

type Page = 'shifts' | 'add' | 'settings' | 'analytics' | 'home';

interface SidebarProps {
  onNavigate: (page: Exclude<Page, 'home'>) => void;
  current: Page;
}

const menuItems: { icon: string; label: string; page: Exclude<Page, 'home'> }[] = [
  { icon: '📊', label: 'История', page: 'shifts' },
  { icon: '➕', label: 'Добавить', page: 'add' },
  { icon: '📈', label: 'Аналитика', page: 'analytics' },
  { icon: '⚙️', label: 'Настройки', page: 'settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, current }) => (
  <aside className="sidebar">
    <div className="logo">
      <DriveStatLogo size={32} />
      <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1, marginLeft: '8px' }}>DriveStat</span>
    </div>
    <nav className="menu">
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.page}
            className={current === item.page ? 'active' : ''}
            onClick={() => {
              onNavigate(item.page);
              window.location.hash = item.page;
            }}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
