import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    ShoppingBag,
    Utensils,
    CreditCard,
    Calendar
} from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
    const navItems = [
        { path: '/', icon: <LayoutDashboard size={24} />, label: 'Home' },
        { path: '/chores', icon: <CheckSquare size={24} />, label: 'Chores' },
        { path: '/groceries', icon: <ShoppingBag size={24} />, label: 'Shop' },
        { path: '/meals', icon: <Utensils size={24} />, label: 'Meals' },
        { path: '/bills', icon: <CreditCard size={24} />, label: 'Bills' },
        { path: '/schedule', icon: <Calendar size={24} />, label: 'Plan' },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
