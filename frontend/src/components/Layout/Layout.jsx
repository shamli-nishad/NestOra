import React from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { formatHeaderDate } from '../../utils/dateUtils';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <header className="app-header">
                    <div className="header-top-row">
                        <h1 className="app-title">NestOra</h1>
                        <span className="app-date">{formatHeaderDate()}</span>
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
