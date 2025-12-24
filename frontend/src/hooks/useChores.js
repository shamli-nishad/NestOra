import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useRetentionPolicy } from './useRetentionPolicy';

export const useChores = () => {
    const [chores, setChores] = useLocalStorage('nestora_chores', []);
    const { applyRetention } = useRetentionPolicy();

    // Auto-Cleanup & Recurrence Reset Effect
    useEffect(() => {
        let updatedChores = [...chores];
        let hasChanges = false;

        // 1. Recurrence Reset: Reset recurring tasks if completed before today
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        updatedChores = updatedChores.map(chore => {
            if (chore.completed && chore.frequency !== 'One-time' && chore.completedAt) {
                const completionDate = new Date(chore.completedAt);
                // If completed strictly before start of today
                if (completionDate < startOfToday) {
                    hasChanges = true;
                    return { ...chore, completed: false, completedAt: null };
                }
            }
            return chore;
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
            console.log("[useChores] Resetting recurring tasks.");
            setChores(updatedChores);
        } else {
            // Only run retention if no heavy reset changes happened to avoid conflict/race in one render cycle
            // largely minimal risk with useLocalStorage but good practice.
            if (chores.length > 0) {
                const cleanedChores = applyRetention(chores, 'completedAt', (item) => item.completed);
                if (cleanedChores.length !== chores.length) {
                    console.log(`[useChores] Cleaning up ${chores.length - cleanedChores.length} old tasks.`);
                    setChores(cleanedChores);
                }
            }
        }
    }, [chores]); // Run on mount and when chores change (to catch updates from other tabs if synced)

    const addChore = (choreData) => {
        setChores([...chores, choreData]);
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

    const updateChore = (updatedChore) => {
        setChores(chores.map(c => c.id === updatedChore.id ? updatedChore : c));
    };

    return {
        chores,
        addChore,
        toggleChore,
        deleteChore,
        updateChore
    };
};
