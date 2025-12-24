import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    CheckSquare,
    ShoppingBag,
    Utensils,
    Settings
} from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
    return (
        <nav className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Home size={20} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <CheckSquare size={20} />
                <span>Tasks</span>
            </NavLink>
            <NavLink to="/groceries" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <ShoppingBag size={20} />
                <span>Groceries</span>
            </NavLink>
            <NavLink to="/meals" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Utensils size={20} />
                <span>Meals</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Settings size={20} />
                <span>Settings</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
