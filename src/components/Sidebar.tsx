import React from 'react';
import './Sidebar.css';

type Page = 'shifts' | 'add' | 'settings';

interface SidebarProps {
  onNavigate: (page: Page) => void;
  current: Page;
}

const menuItems: { icon: string; label: string; page: Page }[] = [
  { icon: '�', label: 'Смены', page: 'shifts' },
  { icon: '➕', label: 'Добавить смену', page: 'add' },
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
            onClick={() => onNavigate(item.page)}
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
