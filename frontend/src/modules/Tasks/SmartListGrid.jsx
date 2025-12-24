import React from 'react';
import { Calendar, Clock, Inbox, Flag } from 'lucide-react';
import './Chores.css'; // Reuse or add new styles

const SmartListGrid = ({ activeView, onViewChange, counts }) => {
    const items = [
        { id: 'today', label: 'Today', icon: <Calendar size={24} />, count: counts.today, color: '#3b82f6' },
        { id: 'scheduled', label: 'Scheduled', icon: <Clock size={24} />, count: counts.scheduled, color: '#ef4444' },
        { id: 'all', label: 'All', icon: <Inbox size={24} />, count: counts.all, color: '#64748b' },
        { id: 'flagged', label: 'Flagged', icon: <Flag size={24} />, count: counts.flagged, color: '#f59e0b' },
    ];

    return (
        <div className="smart-grid">
            {items.map(item => (
                <div
                    key={item.id}
                    className={`smart-card ${activeView === item.id ? 'active' : ''}`}
                    onClick={() => onViewChange(item.id)}
                >
                    <div className="smart-card-header">
                        <div className="icon-circle" style={{ backgroundColor: item.color }}>
                            {item.icon}
                        </div>
                        <span className="smart-count">{item.count}</span>
                    </div>
                    <span className="smart-label">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default SmartListGrid;

