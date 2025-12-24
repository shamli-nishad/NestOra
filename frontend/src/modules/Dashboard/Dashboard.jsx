import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckSquare,
    AlertCircle,
    Package,
    DollarSign,
    Plus,
    Utensils,
    ShoppingBag,
    ShoppingCart,
    CookingPot,
    Clock,
    CheckCircle,
    Circle
} from 'lucide-react';
import { getLocalDateTimeForInput, formatDate } from '../../utils/dateUtils';
import { useTasks } from '../../hooks/useTasks';
import { useLocalStorage } from '../../hooks/useLocalStorage'; // Still needed for inventory etc.
import { useRetentionPolicy } from '../../hooks/useRetentionPolicy'; // Still needed for history
import BottomSheet from '../../components/UI/BottomSheet';
import { isTaskDue, isTaskOverdue } from '../../utils/taskUtils';
import './Dashboard.css';
import '../tasks/tasks.css'; // Import shared styles for task-card

const Dashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState({
        pendingTasks: 0,
        lowInventory: 0,
        monthlySpend: 0,
        pendingShopping: 0
    });
    const [isCookModalOpen, setIsCookModalOpen] = useState(false);

    const { tasks, toggleTask } = useTasks();
    const [inventory, setInventory] = useLocalStorage('nestora_inventory', []);
    const [expenses] = useLocalStorage('nestora_expenses', []);
    const [recipes] = useLocalStorage('nestora_recipes', []);
    const [cookingHistory, setCookingHistory] = useLocalStorage('nestora_cooking_history', []);
    const [shoppingSessions] = useLocalStorage('nestora_shopping_sessions', []);

    const { applyRetention } = useRetentionPolicy();

    // Auto-Cleanup Effect for History (tasks handled by hook)
    useEffect(() => {
        // Clean up Cooking History
        if (cookingHistory.length > 0) {
            const cleanedHistory = applyRetention(cookingHistory, 'date');
            if (cleanedHistory.length !== cookingHistory.length) {
                console.log(`[Retention] Cleaning up ${cookingHistory.length - cleanedHistory.length} history items.`);
                setCookingHistory(cleanedHistory);
            }
        }
    }, [cookingHistory]);

    useEffect(() => {
        // Calculate Summary
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const pendingTasksCount = tasks.filter(c => !c.completed && isTaskDue(c)).length;
        const lowInventoryCount = inventory.filter(i => i.quantity < 2).length;
        const monthlySpendSum = expenses
            .filter(e => e.date && new Date(e.date) >= firstDayOfMonth)
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);

        const pendingShoppingCount = shoppingSessions.length;

        setSummary({
            pendingTasks: pendingTasksCount,
            lowInventory: lowInventoryCount,
            monthlySpend: monthlySpendSum,
            pendingShopping: pendingShoppingCount
        });
    }, [tasks, inventory, expenses, shoppingSessions]);

    // handletoggleTask replaced by toggleTask from hook

    const todaysTasks = tasks.filter(c => {
        const isPendingAndDue = !c.completed && isTaskDue(c);
        const isCompletedToday = c.completed && c.completedAt && new Date(c.completedAt).toDateString() === new Date().toDateString();
        return isPendingAndDue || isCompletedToday;
    }).sort((a, b) => {
        // Sort: Pending first, then Completed by date (most recent first)
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        // Both completed: sort by completedAt descending
        if (a.completed && b.completed) {
            const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return dateB - dateA; // Descending
        }
        return 0;
    });

    const handleLogCook = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const recipeId = formData.get('recipeId');
        const comments = formData.get('comments');
        const dateTime = formData.get('dateTime');

        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const historyEntry = {
            id: crypto.randomUUID(),
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            comments: comments,
            date: new Date(dateTime).toISOString()
        };

        const updatedHistory = [historyEntry, ...cookingHistory];
        setCookingHistory(updatedHistory);

        // Reduce inventory
        let updatedInventory = [...inventory];
        recipe.ingredients?.forEach(ing => {
            const invIndex = updatedInventory.findIndex(i => i.itemId === ing.itemId);
            if (invIndex !== -1) {
                updatedInventory[invIndex] = {
                    ...updatedInventory[invIndex],
                    quantity: Math.max(0, updatedInventory[invIndex].quantity - 1)
                };
            }
        });
        const finalInventory = updatedInventory.filter(i => i.quantity > 0);
        setInventory(finalInventory);

        setIsCookModalOpen(false);
        alert(`Logged "${recipe.title}"! Inventory updated.`);
    };

    return (
        <div className="page dashboard-page">

            {/* Section 1: Summary & Alerts */}
            <div className="dashboard-section summary-section">
                <div className="summary-grid">
                    <div className="summary-card card" onClick={() => navigate('/tasks')}>
                        <div className="icon-box tasks">
                            <CheckSquare size={20} />
                        </div>
                        <div className="info">
                            <span className="label">Today's Tasks</span>
                            <span className="value">{summary.pendingTasks}</span>
                        </div>
                    </div>

                    <div className="summary-card card" onClick={() => navigate('/groceries')}>
                        <div className="icon-box inventory">
                            <Package size={20} />
                        </div>
                        <div className="info">
                            <span className="label">Low Inventory</span>
                            <span className="value">{summary.lowInventory}</span>
                        </div>
                    </div>
                    <div className="summary-card card" onClick={() => navigate('/groceries', { state: { activeTab: 'shopping' } })}>
                        <div className="icon-box shopping">
                            <ShoppingCart size={20} />
                        </div>
                        <div className="info">
                            <span className="label">Pending Shopping</span>
                            <span className="value">{summary.pendingShopping}</span>
                        </div>
                    </div>
                    <div className="summary-card card">
                        <div className="icon-box spend">
                            <DollarSign size={20} />
                        </div>
                        <div className="info">
                            <span className="label">Monthly Spend</span>
                            <span className="value">${summary.monthlySpend.toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Quick Actions */}
            <div className="dashboard-section actions-section">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <button className="action-btn card" onClick={() => navigate('/tasks', { state: { openAddModal: true } })}>
                        <Plus size={20} />
                        <span>Add Task</span>
                    </button>
                    <button className="action-btn card" onClick={() => navigate('/groceries', { state: { openPlanModal: true } })}>
                        <ShoppingCart size={20} />
                        <span>Plan Shopping</span>
                    </button>
                    <button className="action-btn card" onClick={() => setIsCookModalOpen(true)}>
                        <CookingPot size={20} />
                        <span>Cook</span>
                    </button>
                    <button className="action-btn card" onClick={() => navigate('/meals', { state: { openAddModal: true } })}>
                        <Utensils size={20} />
                        <span>Add Recipe</span>
                    </button>
                </div>
            </div>

            {/* Section 3: Today's Tasks List */}
            {todaysTasks.length > 0 && (
                <div className="dashboard-section">
                    <h2>Tasks for Today</h2>
                    <div className="todays-tasks-list">
                        {todaysTasks.map(task => (
                            <div key={task.id} className={`task-card card ${task.completed ? 'completed' : ''} ${isTaskOverdue(task) ? 'overdue' : ''}`}>
                                <button className="check-btn" onClick={() => toggleTask(task.id)}>
                                    {task.completed ? <CheckCircle size={24} color="#10b981" /> : <Circle size={24} color="#cbd5e1" />}
                                </button>
                                <div className="task-info">
                                    <div className="title-row">
                                        <h3>{task.title}</h3>
                                        {task.estimatedTime && (
                                            <span className="time-badge">
                                                <Clock size={12} /> {task.estimatedTime}m
                                            </span>
                                        )}
                                    </div>
                                    <div className="meta">
                                        <span className="category-tag">{task.category}</span>
                                        {task.subCategory && <span className="subcategory-tag">{task.subCategory}</span>}
                                        <span className="frequency-tag">{task.frequency}</span>
                                        <span className={`priority-tag ${task.priority}`}>
                                            {task.priority}
                                        </span>
                                        {task.dueDate && (
                                            <span className="due-date">
                                                {formatDate(task.dueDate)}
                                            </span>
                                        )}
                                    </div>
                                    {task.frequency === 'Weekly' && task.frequencyDays && (
                                        <div className="freq-details" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            {task.frequencyDays.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <BottomSheet
                isOpen={isCookModalOpen}
                onClose={() => setIsCookModalOpen(false)}
                title="Log Cooking"
            >
                <form onSubmit={handleLogCook}>
                    <div className="form-group">
                        <label>What did you cook?</label>
                        <select name="recipeId" required>
                            <option value="">Select a recipe...</option>
                            {recipes.map(r => (
                                <option key={r.id} value={r.id}>{r.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Date & Time</label>
                        <input
                            type="datetime-local"
                            name="dateTime"
                            defaultValue={getLocalDateTimeForInput()}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Comments</label>
                        <textarea name="comments" rows="2" placeholder="Any notes about today's cooking?"></textarea>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={() => setIsCookModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary flex-1">Log Cooking</button>
                    </div>
                </form>
            </BottomSheet>
        </div>
    );
};

export default Dashboard;


