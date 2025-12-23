import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Heart, Users, Clock, MapPin, Bell, CheckCircle } from 'lucide-react';
import './Schedule.css';

const Schedule = () => {
    const [activeTab, setActiveTab] = useState('planner'); // planner, health, social
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('nestora_events');
        return saved ? JSON.parse(saved) : [];
    });
    const [contacts, setContacts] = useState(() => {
        const saved = localStorage.getItem('nestora_contacts');
        return saved ? JSON.parse(saved) : [];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);

    useEffect(() => {
        localStorage.setItem('nestora_events', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        localStorage.setItem('nestora_contacts', JSON.stringify(contacts));
    }, [contacts]);

    const handleAddEvent = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newEvent = {
            id: currentEvent ? currentEvent.id : crypto.randomUUID(),
            title: formData.get('title'),
            startTime: formData.get('startTime'),
            type: formData.get('type'),
            location: formData.get('location'),
            notes: formData.get('notes'),
            healthMetrics: activeTab === 'health' ? {
                weight: formData.get('weight'),
                bloodPressure: formData.get('bp'),
                notes: formData.get('healthNotes')
            } : null,
            createdAt: currentEvent ? currentEvent.createdAt : new Date().toISOString(),
        };

        if (currentEvent) {
            setEvents(events.map(ev => ev.id === currentEvent.id ? newEvent : ev));
        } else {
            setEvents([...events, newEvent]);
        }
        setIsModalOpen(false);
        setCurrentEvent(null);
    };

    const handleAddContact = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newContact = {
            id: crypto.randomUUID(),
            name: formData.get('name'),
            lastContacted: new Date().toISOString(),
            followUpReminder: {
                enabled: true,
                frequencyDays: parseInt(formData.get('freq')),
                nextReminder: new Date(Date.now() + parseInt(formData.get('freq')) * 86400000).toISOString().split('T')[0]
            }
        };
        setContacts([...contacts, newContact]);
        setIsModalOpen(false);
    };

    return (
        <div className="page schedule-page">
            <div className="page-header">
                <div>
                    <h1>Schedule & Time Management</h1>
                    <p>Plan your day and stay connected</p>
                </div>
                <div className="header-actions">
                    <div className="tabs">
                        <button className={`tab ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>Planner</button>
                        <button className={`tab ${activeTab === 'health' ? 'active' : ''}`} onClick={() => setActiveTab('health')}>Health</button>
                        <button className={`tab ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>Social</button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        <span>{activeTab === 'social' ? 'Add Contact' : 'Add Event'}</span>
                    </button>
                </div>
            </div>

            {activeTab === 'planner' && (
                <div className="planner-view">
                    {events.filter(e => e.type !== 'health').length === 0 ? (
                        <div className="empty-state"><Calendar size={48} /><p>No events scheduled for today.</p></div>
                    ) : (
                        <div className="timeline">
                            {events.filter(e => e.type !== 'health').sort((a, b) => a.startTime.localeCompare(b.startTime)).map(ev => (
                                <div key={ev.id} className="timeline-item">
                                    <div className="time">{new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div className="event-card">
                                        <h3>{ev.title}</h3>
                                        <div className="meta">
                                            {ev.location && <span><MapPin size={14} /> {ev.location}</span>}
                                            <span className="type-tag">{ev.type}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'health' && (
                <div className="health-view">
                    <div className="grid">
                        {events.filter(e => e.type === 'health').map(ev => (
                            <div key={ev.id} className="card health-card">
                                <div className="card-header">
                                    <h3>{ev.title}</h3>
                                    <span>{new Date(ev.startTime).toLocaleDateString()}</span>
                                </div>
                                <div className="metrics">
                                    <div className="metric"><span>Weight</span><strong>{ev.healthMetrics?.weight || '-'}</strong></div>
                                    <div className="metric"><span>BP</span><strong>{ev.healthMetrics?.bloodPressure || '-'}</strong></div>
                                </div>
                                <p className="notes">{ev.healthMetrics?.notes}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'social' && (
                <div className="social-view">
                    <div className="grid">
                        {contacts.map(contact => (
                            <div key={contact.id} className="card social-card">
                                <div className="card-info">
                                    <h3>{contact.name}</h3>
                                    <p>Last contacted: {new Date(contact.lastContacted).toLocaleDateString()}</p>
                                    <div className="reminder">
                                        <Bell size={14} />
                                        <span>Next follow-up: {contact.followUpReminder.nextReminder}</span>
                                    </div>
                                </div>
                                <button className="btn btn-icon btn-success" onClick={() => {
                                    setContacts(contacts.map(c => c.id === contact.id ? { ...c, lastContacted: new Date().toISOString(), followUpReminder: { ...c.followUpReminder, nextReminder: new Date(Date.now() + c.followUpReminder.frequencyDays * 86400000).toISOString().split('T')[0] } } : c));
                                }}>
                                    <CheckCircle size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{activeTab === 'social' ? 'Add Contact' : 'Add Event'}</h2>
                        <form onSubmit={activeTab === 'social' ? handleAddContact : handleAddEvent}>
                            {activeTab === 'social' ? (
                                <>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input name="name" required placeholder="John Doe" />
                                    </div>
                                    <div className="form-group">
                                        <label>Follow-up Frequency (days)</label>
                                        <input type="number" name="freq" defaultValue={30} required />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input name="title" required placeholder="e.g. Dentist, Meeting" />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Time</label>
                                            <input type="datetime-local" name="startTime" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Type</label>
                                            <select name="type" defaultValue={activeTab === 'health' ? 'health' : 'personal'}>
                                                <option value="personal">Personal</option>
                                                <option value="work">Work</option>
                                                <option value="school">School</option>
                                                <option value="health">Health</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input name="location" placeholder="e.g. City Dental" />
                                    </div>
                                    {activeTab === 'health' && (
                                        <div className="health-metrics-form">
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Weight</label>
                                                    <input name="weight" placeholder="e.g. 70kg" />
                                                </div>
                                                <div className="form-group">
                                                    <label>BP</label>
                                                    <input name="bp" placeholder="e.g. 120/80" />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Visit Notes</label>
                                                <textarea name="healthNotes" rows="3"></textarea>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;
