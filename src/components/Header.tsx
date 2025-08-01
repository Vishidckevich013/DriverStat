import React from 'react';
import './Header.css';

const Header = () => (
  <header className="header">
    <div className="search">
      <input type="text" placeholder="Search" />
    </div>
    <div className="header-actions">
      <button className="notif">🔔</button>
      <button className="msg">💬</button>
      <span className="user">Ronald R.</span>
      <img className="avatar" src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
    </div>
  </header>
);

export default Header;
