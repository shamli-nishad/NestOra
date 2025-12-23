import React from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import './Layout.css';

const Layout = ({ children }) => {
    const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'TH';
        switch (day % 10) {
            case 1: return 'ST';
            case 2: return 'ND';
            case 3: return 'RD';
            default: return 'TH';
        }
    };

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const monthName = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayNumber = now.getDate();
    const suffix = getOrdinalSuffix(dayNumber);

    const formattedDate = `${dayName}, ${monthName} ${dayNumber}${suffix}`;

    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <header className="app-header">
                    <div className="header-top-row">
                        <h1 className="app-title">NestOra</h1>
                        <span className="app-date">{formattedDate}</span>
                    </div>
                </header>
                <main className="content-area">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
};

export default Layout;
