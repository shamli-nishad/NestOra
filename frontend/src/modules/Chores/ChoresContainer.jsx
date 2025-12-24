import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import ChoresList from './ChoresList';

const ChoresContainer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [chores, setChores] = useLocalStorage('nestora_chores', []);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setIsModalOpen(true);
            // Clear state to prevent reopening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

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

    return (
        <ChoresList
            chores={chores}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            onAddChore={handleAddChore}
            onToggleChore={toggleChore}
            onDeleteChore={deleteChore}
            onCancel={handleCancel}
        />
    );
};

export default ChoresContainer;
