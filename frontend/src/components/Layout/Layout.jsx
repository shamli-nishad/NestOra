import React from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { Search, Bell } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <header className="header">
                    <div className="header-search">
                        <Search size={18} />
                        <input type="text" placeholder="Search anything..." />
                    </div>
                    <div className="header-user">
                        <div className="notifications">
                            <Bell size={20} />
                            <span className="badge"></span>
                        </div>
                        <div className="avatar">A</div>
                    </div>
                </header>
                <main className="content-area">
                    {children}
                </main>
            </div>
            <BottomNav />
        </div>
    );
};

export default Layout;
