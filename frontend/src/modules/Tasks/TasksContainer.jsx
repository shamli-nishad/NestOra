import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTasks } from '../../hooks/useTasks';
import TasksList from './TasksList';

const TasksContainer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');

    // Use centralized hook
    const { tasks, addTask, toggleTask, deleteTask, updateTask } = useTasks();

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setIsModalOpen(true);
            // Clear state to prevent reopening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleaddTaskWrapper = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Handle multi-select frequencyDays
        const frequencyDays = [];
        const checkboxes = e.target.querySelectorAll('input[name="frequencyDays"]:checked');
        checkboxes.forEach((checkbox) => {
            frequencyDays.push(checkbox.value);
        });

        const newTask = {
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
        addTask(newTask);
        setIsModalOpen(false);
    };

    const handleupdateTaskWrapper = (updatedTask) => {
        updateTask(updatedTask);
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        if (location.state?.openAddModal) {
            navigate(-1);
        }
    };

    return (
        <TasksList
            tasks={tasks}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            onAddTask={handleaddTaskWrapper}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={handleupdateTaskWrapper}
            onCancel={handleCancel}
        />
    );
};

export default TasksContainer;


