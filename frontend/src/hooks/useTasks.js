import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useRetentionPolicy } from './useRetentionPolicy';

export const useTasks = () => {
    const [tasks, setTasks] = useLocalStorage('nestora_chores', []); // Keep key for backward compatibility
    const { applyRetention } = useRetentionPolicy();

    // Auto-Cleanup & Recurrence Reset Effect
    useEffect(() => {
        let updatedTasks = [...tasks];
        let hasChanges = false;

        // 1. Recurrence Reset: Reset recurring tasks if completed before today
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        updatedTasks = updatedTasks.map(task => {
            if (task.completed && task.frequency !== 'One-time' && task.completedAt) {
                const completionDate = new Date(task.completedAt);
                // If completed strictly before start of today
                if (completionDate < startOfToday) {
                    hasChanges = true;
                    return { ...task, completed: false, completedAt: null };
                }
            }
            return task;
        });

        // 2. Clean up Completed Tasks (Retention) - Only checks if item.completed is true
        // Note: We apply retention AFTER potentially resetting recurring tasks so we don't delete renewable tasks by mistake?
        // Actually, we should probably run retention on the 'One-time' tasks that remain completed.
        // Or if a recurring task is completed and somehow "old", but our reset logic above handles it.
        // Retention policy usually deletes stuff older than X days.
        // If a recurring task was done 5 days ago, it would be reset above to "pending" today.
        // So applyRetention won't see it as completed anymore. That is correct.
        // Only "One-time" tasks or recurring tasks that accidentally got stuck?
        // Wait, if I completed a daily task 5 days ago, it resets today. 
        // Logic seems sound: reset first, then cleanup what remains completed (which should differ from recurring ones that just reset).

        if (hasChanges) {
            console.log("[useTasks] Resetting recurring tasks.");
            setTasks(updatedTasks);
        } else {
            // Only run retention if no heavy reset changes happened to avoid conflict/race in one render cycle
            // largely minimal risk with useLocalStorage but good practice.
            if (tasks.length > 0) {
                const cleanedTasks = applyRetention(tasks, 'completedAt', (item) => item.completed);
                if (cleanedTasks.length !== tasks.length) {
                    console.log(`[useTasks] Cleaning up ${tasks.length - cleanedTasks.length} old tasks.`);
                    setTasks(cleanedTasks);
                }
            }
        }
    }, [tasks]); // Run on mount and when tasks change

    const addTask = (taskData) => {
        setTasks([...tasks, taskData]);
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => {
            if (t.id === id) {
                const newCompleted = !t.completed;
                return {
                    ...t,
                    completed: newCompleted,
                    completedAt: newCompleted ? new Date().toISOString() : null
                };
            }
            return t;
        }));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const updateTask = (updatedTask) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    return {
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        updateTask
    };
};
