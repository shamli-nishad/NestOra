import React, { useRef } from 'react';
import { Download, Upload, Trash2, AlertTriangle, CheckCircle, Smartphone, Database, CalendarClock } from 'lucide-react';
import { useRetentionPolicy } from '../../hooks/useRetentionPolicy';
import './Settings.css';

const Settings = () => {
    const fileInputRef = useRef(null);
    const { retentionDays, updateRetentionDays } = useRetentionPolicy();

    const getAllData = () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('nestora_')) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    console.error(`Error parsing key ${key}`, e);
                    data[key] = localStorage.getItem(key);
                }
            }
        }
        return data;
    };

    const handleExport = () => {
        const data = getAllData();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `nestora_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert("Backup file downloaded successfully!");
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                let count = 0;

                Object.keys(data).forEach(key => {
                    if (key.startsWith('nestora_')) {
                        const value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
                        localStorage.setItem(key, value);
                        count++;
                    }
                });

                alert(`Successfully restored ${count} data entries! The app will now reload.`);
                window.location.reload();
            } catch (error) {
                console.error("Import Error:", error);
                alert("Failed to import data. Please ensure the file is a valid NestOra backup.");
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };

    const handleReset = () => {
        if (window.confirm("ARE YOU SURE? This will permanently delete ALL your data (Tasks, Recipes, Inventory, History). This action cannot be undone.")) {
            if (window.confirm("Really really sure? Last chance!")) {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('nestora_')) {
                        keysToRemove.push(key);
                    }
                }

                keysToRemove.forEach(key => localStorage.removeItem(key));
                alert("All data has been wiped. App will reload.");
                window.location.reload();
            }
        }
    };

    return (
        <div className="page settings-page">
            <header className="page-header">
                <h1>Settings</h1>
            </header>

            <div className="settings-section">
                <h2><CalendarClock size={20} /> Data Retention</h2>
                <div className="card settings-card">
                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Retention Period</h3>
                            <p>Automatically delete data older than specific days.</p>
                        </div>
                        <div className="retention-control">
                            <select
                                value={retentionDays}
                                onChange={(e) => updateRetentionDays(e.target.value)}
                                className="retention-select"
                            >
                                {Array.from({ length: 14 }, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>{day} Days</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h2><Database size={20} /> Data Management</h2>
                <div className="card settings-card">
                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Export Data</h3>
                            <p>Download a backup of your data</p>
                        </div>
                        <button className="btn-secondary" onClick={handleExport}>
                            <Download size={18} /> Export JSON
                        </button>
                    </div>

                    <div className="divider"></div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Import Data</h3>
                            <p>Restore your data from a backup file. Current data will be overwritten.</p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".json"
                            onChange={handleFileChange}
                        />
                        <button className="btn-secondary" onClick={handleImportClick}>
                            <Upload size={18} /> Import JSON
                        </button>
                    </div>

                    <div className="divider"></div>

                    <div className="setting-item danger-zone">
                        <div className="setting-info">
                            <h3>Reset App Data</h3>
                            <p>Permanently delete all local data and start fresh.</p>
                        </div>
                        <button className="btn-danger" onClick={handleReset}>
                            <Trash2 size={18} /> Reset All Data
                        </button>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h2><Smartphone size={20} /> About</h2>
                <div className="card settings-card">
                    <div className="about-content">
                        <p><strong>NestOra</strong> v1.0.0</p>
                        <p>A Simple Home Management App.</p>
                        <p className="subtext">Data is stored locally on your device. Hence if you are moving to a new device, you will need to backup your data manually.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
