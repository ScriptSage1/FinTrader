import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTrading } from '../../context/TradingContext';
import { TrendingUp, LogOut, User, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export const NavBar = () => {
  const { user, logout } = useAuth();
  const { balance } = useTrading();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => navigate('/dashboard')}>
        <TrendingUp size={24} color="var(--color-secondary)" />
        <span><span>Fin</span>Trader</span>
      </div>

      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/portfolio" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Portfolio
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          History
        </NavLink>
      </nav>

      <div className="nav-right">
        <div className="balance-chip-nav num-align" title="Available cash balance">
          <Wallet size={16} />
          {formatCurrency(balance)}
        </div>

        <div className="user-badge" title={`Logged in as ${user?.username}`}>
          <User size={16} />
          <span>{user?.name || user?.username}</span>
        </div>

        <button 
          onClick={handleLogout} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--color-bg)', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px'
          }}
          title="Logout"
          aria-label="Logout button"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default NavBar;
