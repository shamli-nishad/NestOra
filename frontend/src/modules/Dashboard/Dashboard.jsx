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
    CreditCard,
    ShoppingCart,
    CookingPot
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState({
        pendingChores: 0,
        overdueBills: 0,
        lowInventory: 0,
        monthlySpend: 0,
        pendingShopping: 0
    });
    const [isCookModalOpen, setIsCookModalOpen] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        // Fetch data from localStorage
        const chores = JSON.parse(localStorage.getItem('nestora_chores') || '[]');
        const bills = JSON.parse(localStorage.getItem('nestora_bills') || '[]');
        const inventoryData = JSON.parse(localStorage.getItem('nestora_inventory') || '[]');
        const expenses = JSON.parse(localStorage.getItem('nestora_expenses') || '[]');
        const recipesData = JSON.parse(localStorage.getItem('nestora_recipes') || '[]');

        setInventory(inventoryData);
        setRecipes(recipesData);

        // Calculate Summary
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const pendingChoresCount = chores.filter(c => !c.completed).length;
        const overdueBillsCount = bills.filter(b => b.status === 'pending' && new Date(b.dueDate) < now).length;
        const lowInventoryCount = inventory.filter(i => i.quantity < 2).length;
        const monthlySpendSum = expenses
            .filter(e => e.date && new Date(e.date) >= firstDayOfMonth)
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);

        const pendingShoppingCount = JSON.parse(localStorage.getItem('nestora_shopping_sessions') || '[]').length;

        setSummary({
            pendingChores: pendingChoresCount,
            overdueBills: overdueBillsCount,
            lowInventory: lowInventoryCount,
            monthlySpend: monthlySpendSum,
            pendingShopping: pendingShoppingCount
        });
    }, []);

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

        const existingHistory = JSON.parse(localStorage.getItem('nestora_cooking_history') || '[]');
        const updatedHistory = [historyEntry, ...existingHistory];
        localStorage.setItem('nestora_cooking_history', JSON.stringify(updatedHistory));

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
        localStorage.setItem('nestora_inventory', JSON.stringify(finalInventory));

        setIsCookModalOpen(false);
        alert(`Logged "${recipe.title}"! Inventory updated.`);
    };

    return (
        <div className="page dashboard-page">

            {/* Section 1: Summary & Alerts */}
            <div className="dashboard-section summary-section">
                <div className="summary-grid">
                    <div className="summary-card card" onClick={() => navigate('/chores')}>
                        <div className="icon-box chores">
                            <CheckSquare size={20} />
                        </div>
                        <div className="info">
                            <span className="label">Pending Chores</span>
                            <span className="value">{summary.pendingChores}</span>
                        </div>
                    </div>
                    <div className="summary-card card" onClick={() => navigate('/bills')}>
                        <div className="icon-box bills">
                            <AlertCircle size={20} />
                        </div>
                        <div className="info">
                            <span className="label">Overdue Bills</span>
                            <span className="value">{summary.overdueBills}</span>
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
                    <button className="action-btn card" onClick={() => navigate('/chores', { state: { openAddModal: true } })}>
                        <Plus size={20} />
                        <span>Add Chore</span>
                    </button>
                    {/* <button className="action-btn card" onClick={() => navigate('/groceries', { state: { openAddModal: true } })}>
                        <ShoppingBag size={20} />
                        <span>Add Expense</span>
                    </button> */}
                    <button className="action-btn card" onClick={() => navigate('/groceries', { state: { openPlanModal: true } })}>
                        <ShoppingCart size={20} />
                        <span>Plan Shopping</span>
                    </button>
                    {/* <button className="action-btn card" onClick={() => navigate('/bills', { state: { openAddModal: true } })}>
                        <CreditCard size={20} />
                        <span>Add Bill</span>
                    </button> */}
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

            {isCookModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCookModalOpen(false)}>
                    <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
                        <div className="sheet-handle"></div>
                        <h2>Log Cooking</h2>
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
                                    defaultValue={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
