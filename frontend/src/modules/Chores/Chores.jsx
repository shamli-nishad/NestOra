import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, Circle, Trash2, Clock, AlertCircle } from 'lucide-react';
import './Chores.css';

const Chores = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [chores, setChores] = useState(() => {
        const saved = localStorage.getItem('nestora_chores');
        return saved ? JSON.parse(saved) : [];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setIsModalOpen(true);
            // Clear state to prevent reopening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        localStorage.setItem('nestora_chores', JSON.stringify(chores));
    }, [chores]);

    const handleAddChore = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newChore = {
            id: crypto.randomUUID(),
            title: formData.get('title'),
            category: formData.get('category'),
            frequency: formData.get('frequency'),
            estimatedTime: formData.get('estimatedTime'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate'),
            completed: false,
            createdAt: new Date().toISOString(),
        };
        setChores([...chores, newChore]);
        setIsModalOpen(false);
    };

    const toggleChore = (id) => {
        setChores(chores.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
    };

    const deleteChore = (id) => {
        setChores(chores.filter(c => c.id !== id));
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        if (location.state?.openAddModal) {
            navigate(-1);
        }
    };

    const filteredChores = chores.filter(c => activeTab === 'pending' ? !c.completed : c.completed);

    return (
        <div className="page chores-page">

            <div className="segmented-control">
                <button
                    className={`segment ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending
                    <span className="segment-count">
                        {chores.filter(c => !c.completed).length}
                    </span>
                </button>
                <button
                    className={`segment ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed
                    <span className="segment-count">
                        {chores.filter(c => c.completed).length}
                    </span>
                </button>
            </div>

            <button className="btn-primary full-width add-btn-main" onClick={() => setIsModalOpen(true)}>
                <Plus size={20} /> Add New Chore
            </button>

            <div className="chore-list">
                {filteredChores.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle size={48} color="#cbd5e1" />
                        <p>All caught up!</p>
                    </div>
                ) : (
                    filteredChores.map(chore => (
                        <div key={chore.id} className={`chore-card card ${chore.completed ? 'completed' : ''}`}>
                            <button className="check-btn" onClick={() => toggleChore(chore.id)}>
                                {chore.completed ? <CheckCircle size={24} color="#10b981" /> : <Circle size={24} color="#cbd5e1" />}
                            </button>
                            <div className="chore-info">
                                <div className="title-row">
                                    <h3>{chore.title}</h3>
                                    {chore.estimatedTime && (
                                        <span className="time-badge">
                                            <Clock size={12} /> {chore.estimatedTime}m
                                        </span>
                                    )}
                                </div>
                                <div className="meta">
                                    <span className="category-tag">{chore.category}</span>
                                    <span className="frequency-tag">{chore.frequency}</span>
                                    <span className={`priority-tag ${chore.priority}`}>
                                        {chore.priority}
                                    </span>
                                    {chore.dueDate && (
                                        <span className="due-date">
                                            {new Date(chore.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button className="delete-btn" onClick={() => deleteChore(chore.id)}>
                                <Trash2 size={18} color="#94a3b8" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCancel}>
                    <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
                        <div className="sheet-handle"></div>
                        <h2>Add New Chore</h2>
                        <form onSubmit={handleAddChore}>
                            <div className="form-group">
                                <label>Chore Title</label>
                                <input name="title" required placeholder="e.g. Vacuum living room" autoFocus />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select name="category">
                                        <option value="Kitchen">Kitchen</option>
                                        <option value="Bathroom">Bathroom</option>
                                        <option value="Living Room">Living Room</option>
                                        <option value="Bedroom">Bedroom</option>
                                        <option value="Outdoor">Outdoor</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Frequency</label>
                                    <select name="frequency">
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="One-time">One-time</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Estimated Time (Min)</label>
                                    <input type="number" name="estimatedTime" placeholder="30" />
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select name="priority">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input type="date" name="dueDate" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary full-width" onClick={handleCancel}>Cancel</button>
                                <button type="submit" className="btn-primary full-width">Add Chore</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chores;
