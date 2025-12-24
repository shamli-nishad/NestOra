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

        // Handle multi-select frequencyDays
        const frequencyDays = [];
        // FormData.getAll isn't always available in older browsers, but likely fine here.
        // Or we iterate. iterating over checkboxes with name="frequencyDays"
        // React synthetic event target is the form.
        const checkboxes = e.target.querySelectorAll('input[name="frequencyDays"]:checked');
        checkboxes.forEach((checkbox) => {
            frequencyDays.push(checkbox.value);
        });

        const newChore = {
            id: crypto.randomUUID(),
            title: formData.get('title'),
            category: formData.get('category'),
            subCategory: formData.get('subCategory'),
            frequency: formData.get('frequency'),
            frequencyDays: frequencyDays, // Array of days ['Mon', 'Wed']
            frequencyDate: formData.get('frequencyDate'), // '1'-'31'
            estimatedTime: formData.get('estimatedTime'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate'), // Only for One-time
            completed: false,
            createdAt: new Date().toISOString(),
        };
        setChores([...chores, newChore]);
        setIsModalOpen(false);
    };

    const toggleChore = (id) => {
        setChores(chores.map(c => {
            if (c.id === id) {
                const newCompleted = !c.completed;
                return {
                    ...c,
                    completed: newCompleted,
                    completedAt: newCompleted ? new Date().toISOString() : null
                };
            }
            return c;
        }));
    };

    const deleteChore = (id) => {
        setChores(chores.filter(c => c.id !== id));
    };

    const handleUpdateChore = (updatedChore) => {
        setChores(chores.map(c => c.id === updatedChore.id ? updatedChore : c));
        setIsModalOpen(false);
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
            onUpdateChore={handleUpdateChore}
            onCancel={handleCancel}
        />
    );
};

export default ChoresContainer;
