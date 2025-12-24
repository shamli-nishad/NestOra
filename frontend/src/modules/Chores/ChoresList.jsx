import React from 'react';
import { Plus, CheckCircle, Circle, Trash2, Clock, AlertCircle } from 'lucide-react';
import { CHORE_CATEGORIES, CHORE_FREQUENCIES, CHORE_PRIORITIES } from '../../constants';
import { formatDate } from '../../utils/dateUtils';
import BottomSheet from '../../components/UI/BottomSheet';
import SegmentedControl from '../../components/UI/SegmentedControl';
import './Chores.css';

const ChoresList = ({
    chores,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    onAddChore,
    onToggleChore,
    onDeleteChore,
    onCancel
}) => {
    const filteredChores = chores.filter(c => activeTab === 'pending' ? !c.completed : c.completed);


    const [selectedFrequency, setSelectedFrequency] = React.useState(CHORE_FREQUENCIES[0]);

    return (
        <div className="page chores-page">
            <SegmentedControl
                options={[
                    { value: 'pending', label: `Pending (${chores.filter(c => !c.completed).length})` },
                    { value: 'completed', label: `Completed (${chores.filter(c => c.completed).length})` }
                ]}
                value={activeTab}
                onChange={setActiveTab}
            />

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
                            <button className="check-btn" onClick={() => onToggleChore(chore.id)}>
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
                                            {formatDate(chore.dueDate)}
                                        </span>
                                    )}
                                </div>
                                {chore.frequency === 'Weekly' && chore.frequencyDays && (
                                    <div className="freq-details">
                                        {chore.frequencyDays.join(', ')}
                                    </div>
                                )}
                            </div>
                            <button className="delete-btn" onClick={() => onDeleteChore(chore.id)}>
                                <Trash2 size={18} color="#94a3b8" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <BottomSheet
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Chore"
            >
                <form onSubmit={onAddChore}>
                    <div className="form-group">
                        <label>Chore Title</label>
                        <input name="title" required placeholder="e.g. Wash Dishes" autoFocus />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category">
                                {CHORE_CATEGORIES.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select name="priority">
                                {CHORE_PRIORITIES.map(priority => (
                                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Frequency</label>
                        <select
                            name="frequency"
                            value={selectedFrequency}
                            onChange={(e) => setSelectedFrequency(e.target.value)}
                        >
                            {CHORE_FREQUENCIES.map(freq => (
                                <option key={freq} value={freq}>{freq}</option>
                            ))}
                        </select>
                    </div>

                    {selectedFrequency === 'Weekly' && (
                        <div className="form-group">
                            <label>Repeat On</label>
                            <div className="week-days-selector">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <label key={day} className="day-checkbox">
                                        <input type="checkbox" name="frequencyDays" value={day} />
                                        <span>{day}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedFrequency === 'Monthly' && (
                        <div className="form-group">
                            <label>Day of Month</label>
                            <select name="frequencyDate" defaultValue="1">
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedFrequency === 'One-time' && (
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" name="dueDate" required />
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary full-width" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="btn-primary full-width">Add Chore</button>
                    </div>
                </form>
            </BottomSheet>
        </div>
    );
};

export default ChoresList;
