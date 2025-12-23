import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    AlertCircle,
    ShoppingBag,
    CreditCard,
    TrendingUp,
    Plus,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        pendingChores: 0,
        overdueBills: 0,
        lowInventory: 0,
        monthlyExpenses: 0
    });

    const [recentExpenses, setRecentExpenses] = useState([]);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    useEffect(() => {
        const chores = JSON.parse(localStorage.getItem('nestora_chores') || '[]');
        const bills = JSON.parse(localStorage.getItem('nestora_bills') || '[]');
        const inventory = JSON.parse(localStorage.getItem('nestora_inventory') || '[]');
        const expenses = JSON.parse(localStorage.getItem('nestora_expenses') || '[]');

        const pendingChores = chores.filter(c => c.status === 'pending').length;
        const overdueBills = bills.filter(b => b.status === 'unpaid' && new Date(b.dueDate) < new Date()).length;
        const lowInventory = inventory.filter(i => i.quantity < 2).length;

        const currentMonth = new Date().getMonth();
        const monthlyExpenses = expenses
            .filter(e => new Date(e.date).getMonth() === currentMonth)
            .reduce((sum, e) => sum + e.amount, 0);

        setStats({ pendingChores, overdueBills, lowInventory, monthlyExpenses });
        setRecentExpenses(expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
    }, []);

    const handleAddManualExpense = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newExpense = {
            id: crypto.randomUUID(),
            amount: parseFloat(formData.get('amount')),
            date: new Date().toISOString(),
            category: formData.get('category'),
            sourceType: 'manual',
            description: formData.get('description')
        };

        const updatedExpenses = [newExpense, ...recentExpenses].slice(0, 5);
        setRecentExpenses(updatedExpenses);

        const allExpenses = JSON.parse(localStorage.getItem('nestora_expenses') || '[]');
        localStorage.setItem('nestora_expenses', JSON.stringify([newExpense, ...allExpenses]));

        setIsExpenseModalOpen(false);
        alert('Expense logged manually!');
    };

    return (
        <div className="page dashboard-page">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Your life at a glance</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsExpenseModalOpen(true)}>
                    <Plus size={20} />
                    <span>Log Expense</span>
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon chores"><CheckCircle size={24} /></div>
                    <div className="stat-info">
                        <span>Pending Chores</span>
                        <strong>{stats.pendingChores}</strong>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bills"><AlertCircle size={24} /></div>
                    <div className="stat-info">
                        <span>Overdue Bills</span>
                        <strong>{stats.overdueBills}</strong>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon inventory"><ShoppingBag size={24} /></div>
                    <div className="stat-info">
                        <span>Low Inventory</span>
                        <strong>{stats.lowInventory}</strong>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon expenses"><TrendingUp size={24} /></div>
                    <div className="stat-info">
                        <span>Monthly Spend</span>
                        <strong>${stats.monthlyExpenses.toFixed(2)}</strong>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="recent-expenses card">
                    <div className="card-header">
                        <h3>Recent Expenses</h3>
                        <button className="btn-text">View All</button>
                    </div>
                    <div className="expense-list">
                        {recentExpenses.length === 0 ? (
                            <p className="empty-hint">No expenses logged yet.</p>
                        ) : (
                            recentExpenses.map(exp => (
                                <div key={exp.id} className="expense-item">
                                    <div className="exp-info">
                                        <strong>{exp.description}</strong>
                                        <span>{exp.category} • {new Date(exp.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`exp-amount ${exp.sourceType}`}>
                                        ${exp.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="quick-actions card">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        <button className="action-btn">Add Chore</button>
                        <button className="action-btn">Plan Meal</button>
                        <button className="action-btn">Start Shopping</button>
                        <button className="action-btn">New Appointment</button>
                    </div>
                </div>
            </div>

            {isExpenseModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Log Manual Expense</h2>
                        <form onSubmit={handleAddManualExpense}>
                            <div className="form-group">
                                <label>Description</label>
                                <input name="description" required placeholder="e.g. Coffee, Movie tickets" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Amount</label>
                                    <input type="number" step="0.01" name="amount" required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select name="category">
                                        <option>Food & Drink</option>
                                        <option>Entertainment</option>
                                        <option>Transport</option>
                                        <option>Shopping</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => setIsExpenseModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Log Expense</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
