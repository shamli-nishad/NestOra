import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, Heart, MessageSquare, ChevronRight, Trash2 } from 'lucide-react';
import './Schedule.css';

const Schedule = () => {
    const [activeTab, setActiveTab] = useState('planner'); // planner, contacts
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('nestora_events');
        return saved ? JSON.parse(saved) : [];
    });
    const [contacts, setContacts] = useState(() => {
        const saved = localStorage.getItem('nestora_contacts');
        return saved ? JSON.parse(saved) : [];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('event'); // event, contact

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
            id: crypto.randomUUID(),
            title: formData.get('title'),
            time: formData.get('time'),
            type: formData.get('type'),
            metrics: formData.get('type') === 'health' ? {
                weight: formData.get('weight'),
                bp: formData.get('bp')
            } : null,
            createdAt: new Date().toISOString(),
        };
        setEvents([...events, newEvent]);
        setIsModalOpen(false);
    };

    const handleAddContact = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newContact = {
            id: crypto.randomUUID(),
            name: formData.get('name'),
            lastContact: formData.get('lastContact'),
            frequency: formData.get('frequency'),
            notes: formData.get('notes'),
        };
        setContacts([...contacts, newContact]);
        setIsModalOpen(false);
    };

    return (
        <div className="page schedule-page">

            <div className="segmented-control">
                <button className={`segment ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>Planner</button>
                <button className={`segment ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>Social</button>
            </div>

            {activeTab === 'planner' && (
                <div className="planner-view">
                    <div className="timeline">
                        {events.length === 0 ? (
                            <div className="empty-state"><Calendar size={48} color="#cbd5e1" /><p>No events today.</p></div>
                        ) : (
                            events.sort((a, b) => a.time.localeCompare(b.time)).map(event => (
                                <div key={event.id} className="timeline-item">
                                    <div className="time-col">
                                        <span className="time">{event.time}</span>
                                    </div>
                                    <div className={`event-card card ${event.type}`}>
                                        <div className="event-info">
                                            <h3>{event.title}</h3>
                                            <span className="type-tag">{event.type}</span>
                                            {event.metrics && (
                                                <div className="health-metrics">
                                                    <span>{event.metrics.weight}kg</span>
                                                    <span>{event.metrics.bp} BP</span>
                                                </div>
                                            )}
                                        </div>
                                        <button className="btn-icon" onClick={() => setEvents(events.filter(e => e.id !== event.id))}>
                                            <Trash2 size={16} color="#94a3b8" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button className="fab-add" onClick={() => { setModalType('event'); setIsModalOpen(true); }}>
                        <Plus size={24} color="white" />
                    </button>
                </div>
            )}

            {activeTab === 'contacts' && (
                <div className="contacts-list">
                    {contacts.map(contact => (
                        <div key={contact.id} className="contact-card card">
                            <div className="contact-main">
                                <div className="contact-avatar">
                                    <User size={20} color="white" />
                                </div>
                                <div className="contact-info">
                                    <h3>{contact.name}</h3>
                                    <p>Last contact: {new Date(contact.lastContact).toLocaleDateString()}</p>
                                </div>
                                <div className="contact-status">
                                    <MessageSquare size={18} color="#2563eb" />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="fab-add" onClick={() => { setModalType('contact'); setIsModalOpen(true); }}>
                        <Plus size={24} color="white" />
                    </button>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
                        <div className="sheet-handle"></div>
                        <h2>{modalType === 'event' ? 'Add Event' : 'Add Contact'}</h2>
                        {modalType === 'event' ? (
                            <form onSubmit={handleAddEvent}>
                                <div className="form-group">
                                    <label>Event Title</label>
                                    <input name="title" required placeholder="e.g. Doctor Appointment" autoFocus />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Time</label>
                                        <input type="time" name="time" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select name="type">
                                            <option value="appointment">Appointment</option>
                                            <option value="health">Health Check</option>
                                            <option value="social">Social</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="btn-primary full-width">Add Event</button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleAddContact}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input name="name" required placeholder="e.g. Mom" autoFocus />
                                </div>
                                <div className="form-group">
                                    <label>Last Contact</label>
                                    <input type="date" name="lastContact" required />
                                </div>
                                <div className="form-group">
                                    <label>Frequency (days)</label>
                                    <input type="number" name="frequency" defaultValue={7} />
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="btn-primary full-width">Add Contact</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;
