import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, CreditCard, Calendar, Check, AlertCircle, Trash2, ChevronRight, DollarSign } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import BottomSheet from '../../components/UI/BottomSheet';
import SegmentedControl from '../../components/UI/SegmentedControl';
import './Bills.css';

const Bills = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending'); // pending, paid
    const [bills, setBills] = useLocalStorage('nestora_bills', []);
    const [expenses, setExpenses] = useLocalStorage('nestora_expenses', []);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);



    const handleAddBill = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newBill = {
            id: crypto.randomUUID(),
            title: formData.get('title'),
            amount: parseFloat(formData.get('amount')),
            dueDate: formData.get('dueDate'),
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        setBills([...bills, newBill]);
        setIsModalOpen(false);
    };

    const markAsPaid = (id) => {
        const bill = bills.find(b => b.id === id);
        const billExpense = {
            id: crypto.randomUUID(),
            title: `Bill Payment: ${bill.title}`,
            amount: bill.amount,
            category: 'Bills',
            date: new Date().toISOString()
        };
        setExpenses([billExpense, ...expenses]);

        setBills(bills.map(b => b.id === id ? { ...b, status: 'paid' } : b));
        alert(`Bill "${bill.title}" marked as paid and logged as expense.`);
    };

    const deleteBill = (id) => {
        setBills(bills.filter(b => b.id !== id));
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        if (location.state?.openAddModal) {
            navigate(-1);
        }
    };

    const filteredBills = bills.filter(b => activeTab === 'pending' ? b.status === 'pending' : b.status === 'paid');

    return (
        <div className="page bills-page">

            <SegmentedControl
                options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'paid', label: 'Paid' }
                ]}
                value={activeTab}
                onChange={setActiveTab}
            />

            <div className="bill-list">
                {filteredBills.length === 0 ? (
                    <div className="empty-state"><CreditCard size={48} color="#cbd5e1" /><p>No bills here.</p></div>
                ) : (
                    filteredBills.map(bill => (
                        <div key={bill.id} className="bill-card card">
                            <div className="info">
                                <h3>{bill.title}</h3>
                                <div className="meta">
                                    <span className="amount">${bill.amount}</span>
                                    <span className="due-date"><Calendar size={14} /> {formatDate(bill.dueDate)}</span>
                                </div>
                            </div>
                            <div className="actions">
                                {bill.status === 'pending' && (
                                    <button className="btn-success-sm" onClick={() => markAsPaid(bill.id)}>
                                        <Check size={16} /> Pay
                                    </button>
                                )}
                                <button className="btn-icon" onClick={() => deleteBill(bill.id)}>
                                    <Trash2 size={18} color="#94a3b8" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className="fab-add" onClick={() => setIsModalOpen(true)}>
                <Plus size={24} color="white" />
            </button>

            <BottomSheet
                isOpen={isModalOpen}
                onClose={handleCancel}
                title="Add New Bill"
            >
                <form onSubmit={handleAddBill}>
                    <div className="form-group">
                        <label>Bill Title</label>
                        <input name="title" required placeholder="e.g. Electricity" autoFocus />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Amount ($)</label>
                            <input type="number" name="amount" step="0.01" required />
                        </div>
                        <div className="form-group">
                            <label>Due Date</label>
                            <input type="date" name="dueDate" required />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary full-width" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="btn-primary full-width">Add Bill</button>
                    </div>
                </form>
            </BottomSheet>
        </div>
    );
};

export default Bills;
