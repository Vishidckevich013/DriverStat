import React from 'react';
import './Sidebar.css';

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
      <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: 2 }}>DRIVER <span style={{ color: '#6c4aff' }}>STAT</span></span>
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
