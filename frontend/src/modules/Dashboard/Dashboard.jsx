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
    ShoppingCart
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

    useEffect(() => {
        // Fetch data from localStorage
        const chores = JSON.parse(localStorage.getItem('nestora_chores') || '[]');
        const bills = JSON.parse(localStorage.getItem('nestora_bills') || '[]');
        const inventory = JSON.parse(localStorage.getItem('nestora_inventory') || '[]');
        const expenses = JSON.parse(localStorage.getItem('nestora_expenses') || '[]');

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
                    <button className="action-btn card" onClick={() => navigate('/meals', { state: { openAddModal: true } })}>
                        <Utensils size={20} />
                        <span>Add Meal</span>
                    </button>
                    <button className="action-btn card" onClick={() => navigate('/groceries', { state: { openAddModal: true } })}>
                        <ShoppingBag size={20} />
                        <span>Add Expense</span>
                    </button>
                    <button className="action-btn card" onClick={() => navigate('/groceries', { state: { openPlanModal: true } })}>
                        <ShoppingCart size={20} />
                        <span>Plan Shopping</span>
                    </button>
                    <button className="action-btn card" onClick={() => navigate('/bills', { state: { openAddModal: true } })}>
                        <CreditCard size={20} />
                        <span>Add Bill</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
