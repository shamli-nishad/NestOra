import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, AlertCircle, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import './Bills.css';

const Bills = () => {
    const [bills, setBills] = useState(() => {
        const saved = localStorage.getItem('nestora_bills');
        return saved ? JSON.parse(saved) : [];
    });
    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('nestora_expenses');
        return saved ? JSON.parse(saved) : [];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBill, setCurrentBill] = useState(null);

    useEffect(() => {
        localStorage.setItem('nestora_bills', JSON.stringify(bills));
    }, [bills]);

    useEffect(() => {
        localStorage.setItem('nestora_expenses', JSON.stringify(expenses));
    }, [expenses]);

    const handleAddBill = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newBill = {
            id: currentBill ? currentBill.id : crypto.randomUUID(),
            title: formData.get('title'),
            amount: parseFloat(formData.get('amount')),
            dueDate: formData.get('dueDate'),
            category: formData.get('category'),
            status: currentBill ? currentBill.status : 'unpaid',
            createdAt: currentBill ? currentBill.createdAt : new Date().toISOString(),
        };

        if (currentBill) {
            setBills(bills.map(b => b.id === currentBill.id ? newBill : b));
        } else {
            setBills([...bills, newBill]);
        }
        setIsModalOpen(false);
        setCurrentBill(null);
    };

    const markAsPaid = (bill) => {
        if (bill.status === 'paid') return;

        // 1. Update Bill status
        const updatedBills = bills.map(b =>
            b.id === bill.id ? { ...b, status: 'paid', updatedAt: new Date().toISOString() } : b
        );
        setBills(updatedBills);

        // 2. Log Expense
        const newExpense = {
            id: crypto.randomUUID(),
            amount: bill.amount,
            date: new Date().toISOString(),
            category: 'Bills',
            sourceType: 'bill',
            sourceId: bill.id,
            description: `Payment for ${bill.title}`
        };
        setExpenses([...expenses, newExpense]);

        alert(`Bill "${bill.title}" marked as paid. Expense logged!`);
    };

    const deleteBill = (id) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            setBills(bills.filter(b => b.id !== id));
        }
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    };

    return (
        <div className="page bills-page">
            <div className="page-header">
                <div>
                    <h1>Bills & Subscriptions</h1>
                    <p>Track your recurring payments and expenses</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    <span>Add Bill</span>
                </button>
            </div>

            <div className="bills-grid">
                {bills.length === 0 ? (
                    <div className="empty-state"><CreditCard size={48} /><p>No bills tracked yet.</p></div>
                ) : (
                    bills.map(bill => (
                        <div key={bill.id} className={`bill-card ${bill.status} ${bill.status === 'unpaid' && isOverdue(bill.dueDate) ? 'overdue' : ''}`}>
                            <div className="bill-info">
                                <div className="bill-main">
                                    <h3>{bill.title}</h3>
                                    <span className="bill-amount">${bill.amount.toFixed(2)}</span>
                                </div>
                                <div className="bill-meta">
                                    <span className="tag">{bill.category}</span>
                                    <span className="due-date">
                                        {bill.status === 'unpaid' && isOverdue(bill.dueDate) && <AlertCircle size={14} />}
                                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="bill-actions">
                                {bill.status === 'unpaid' ? (
                                    <button className="btn btn-success btn-sm" onClick={() => markAsPaid(bill)}>
                                        <CheckCircle size={16} /> Mark Paid
                                    </button>
                                ) : (
                                    <span className="paid-badge"><CheckCircle size={16} /> Paid</span>
                                )}
                                <button className="btn-icon" onClick={() => { setCurrentBill(bill); setIsModalOpen(true); }}><Edit2 size={18} /></button>
                                <button className="btn-icon btn-danger" onClick={() => deleteBill(bill.id)}><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{currentBill ? 'Edit Bill' : 'Add New Bill'}</h2>
                        <form onSubmit={handleAddBill}>
                            <div className="form-group">
                                <label>Bill Title</label>
                                <input name="title" defaultValue={currentBill?.title} required placeholder="e.g. Netflix, Rent" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Amount</label>
                                    <input type="number" step="0.01" name="amount" defaultValue={currentBill?.amount} required />
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input type="date" name="dueDate" defaultValue={currentBill?.dueDate} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" defaultValue={currentBill?.category || 'Utilities'}>
                                    <option>Utilities</option>
                                    <option>Rent/Mortgage</option>
                                    <option>Streaming</option>
                                    <option>Insurance</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => { setIsModalOpen(false); setCurrentBill(null); }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{currentBill ? 'Update' : 'Add'} Bill</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bills;
