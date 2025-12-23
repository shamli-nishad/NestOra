import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, Trash2, Edit2 } from 'lucide-react';
import './Chores.css';

const Chores = () => {
    const [chores, setChores] = useState(() => {
        const saved = localStorage.getItem('nestora_chores');
        return saved ? JSON.parse(saved) : [];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentChore, setCurrentChore] = useState(null);

    useEffect(() => {
        localStorage.setItem('nestora_chores', JSON.stringify(chores));
    }, [chores]);

    const handleAddChore = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newChore = {
            id: currentChore ? currentChore.id : crypto.randomUUID(),
            title: formData.get('title'),
            category: formData.get('category'),
            frequency: formData.get('frequency'),
            estimatedTime: formData.get('estimatedTime'),
            status: currentChore ? currentChore.status : 'pending',
            lastCompleted: currentChore ? currentChore.lastCompleted : null,
            createdAt: currentChore ? currentChore.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (currentChore) {
            setChores(chores.map(c => c.id === currentChore.id ? newChore : c));
        } else {
            setChores([...chores, newChore]);
        }

        setIsModalOpen(false);
        setCurrentChore(null);
    };

    const toggleStatus = (id) => {
        setChores(chores.map(chore => {
            if (chore.id === id) {
                const isCompleted = chore.status === 'completed';
                return {
                    ...chore,
                    status: isCompleted ? 'pending' : 'completed',
                    lastCompleted: isCompleted ? chore.lastCompleted : new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
            }
            return chore;
        }));
    };

    const deleteChore = (id) => {
        if (window.confirm('Are you sure you want to delete this chore?')) {
            setChores(chores.filter(c => c.id !== id));
        }
    };

    return (
        <div className="page chores-page">
            <div className="page-header">
                <div>
                    <h1>Household Chores</h1>
                    <p>Keep your home clean and organized</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    <span>Add Chore</span>
                </button>
            </div>

            <div className="chores-grid">
                {chores.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle size={48} />
                        <p>No chores yet. Start by adding one!</p>
                    </div>
                ) : (
                    chores.map(chore => (
                        <div key={chore.id} className={`chore-card ${chore.status}`}>
                            <div className="chore-info">
                                <h3>{chore.title}</h3>
                                <div className="chore-meta">
                                    <span className="tag">{chore.category}</span>
                                    <span className="meta-item"><Clock size={14} /> {chore.estimatedTime}m</span>
                                    <span className="meta-item">{chore.frequency}</span>
                                </div>
                            </div>
                            <div className="chore-actions">
                                <button
                                    className={`btn-icon ${chore.status === 'completed' ? 'btn-success' : ''}`}
                                    onClick={() => toggleStatus(chore.id)}
                                    title={chore.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                                >
                                    <CheckCircle size={20} />
                                </button>
                                <button className="btn-icon" onClick={() => { setCurrentChore(chore); setIsModalOpen(true); }}>
                                    <Edit2 size={18} />
                                </button>
                                <button className="btn-icon btn-danger" onClick={() => deleteChore(chore.id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{currentChore ? 'Edit Chore' : 'Add New Chore'}</h2>
                        <form onSubmit={handleAddChore}>
                            <div className="form-group">
                                <label>Title</label>
                                <input name="title" defaultValue={currentChore?.title} required placeholder="e.g. Vacuum Living Room" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select name="category" defaultValue={currentChore?.category || 'Cleaning'}>
                                        <option>Cleaning</option>
                                        <option>Laundry</option>
                                        <option>Maintenance</option>
                                        <option>Garden</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Frequency</label>
                                    <select name="frequency" defaultValue={currentChore?.frequency || 'Weekly'}>
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                        <option>Custom</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Estimated Time (minutes)</label>
                                <input type="number" name="estimatedTime" defaultValue={currentChore?.estimatedTime || 30} required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => { setIsModalOpen(false); setCurrentChore(null); }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{currentChore ? 'Update' : 'Add'} Chore</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chores;
