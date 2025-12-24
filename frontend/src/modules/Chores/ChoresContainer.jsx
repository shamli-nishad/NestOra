import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChores } from '../../hooks/useChores';
import ChoresList from './ChoresList';

const ChoresContainer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');

    // Use centralized hook
    const { chores, addChore, toggleChore, deleteChore, updateChore } = useChores();

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setIsModalOpen(true);
            // Clear state to prevent reopening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleAddChoreWrapper = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Handle multi-select frequencyDays
        const frequencyDays = [];
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
            frequencyDays: frequencyDays,
            frequencyDate: formData.get('frequencyDate'),
            estimatedTime: formData.get('estimatedTime'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate'),
            completed: false,
            createdAt: new Date().toISOString(),
        };
        addChore(newChore);
        setIsModalOpen(false);
    };

    const handleUpdateChoreWrapper = (updatedChore) => {
        updateChore(updatedChore);
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
            onAddChore={handleAddChoreWrapper}
            onToggleChore={toggleChore}
            onDeleteChore={deleteChore}
            onUpdateChore={handleUpdateChoreWrapper}
            onCancel={handleCancel}
        />
    );
};

export default ChoresContainer;
