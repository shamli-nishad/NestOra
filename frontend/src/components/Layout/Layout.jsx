import React from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <header className="header">
                    <div className="header-search">
                        <input type="text" placeholder="Search everything..." />
                    </div>
                    <div className="header-user">
                        <span>Admin</span>
                        <div className="avatar">A</div>
                    </div>
                </header>
                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
