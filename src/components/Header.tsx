import './Header.css';
import DriveStatLogo from './DriveStatLogo';

const Header = () => (
  <header className="header">
    <div className="header-brand">
      <DriveStatLogo size={40} className="header-logo" />
      <span className="header-title">DriveStat</span>
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
