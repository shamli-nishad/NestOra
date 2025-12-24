import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    ShoppingBag,
    Utensils,
    CreditCard,
    Calendar,
    Home,
    Settings
} from 'lucide-react';
import { APP_VERSION } from '../../version';
import './Sidebar.css';

const Sidebar = () => {
    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/chores', icon: <CheckSquare size={20} />, label: 'Chores' },
        { path: '/groceries', icon: <ShoppingBag size={20} />, label: 'Groceries' },
        { path: '/meals', icon: <Utensils size={20} />, label: 'Meals' },
        { path: '/bills', icon: <CreditCard size={20} />, label: 'Bills' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <Home size={24} color="white" />
                </div>
                <h2>NestOra</h2>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="footer-actions">
                    <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </NavLink>
                </div>
                <div className="version-info">
                    <span className="version">v{APP_VERSION}</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
