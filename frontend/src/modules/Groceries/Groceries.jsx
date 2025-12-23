import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, ShoppingBag, Package, ChevronRight, Check, Trash2, Edit2, ShoppingCart, CheckSquare } from 'lucide-react';
import './Groceries.css';

const Groceries = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inventory'); // inventory, master, shopping
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('nestora_master_items');
        return saved ? JSON.parse(saved) : [];
    });
    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('nestora_inventory');
        return saved ? JSON.parse(saved) : [];
    });
    const [shoppingSession, setShoppingSession] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setActiveTab('master'); // Switch to master list where Add button is
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        localStorage.setItem('nestora_master_items', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        localStorage.setItem('nestora_inventory', JSON.stringify(inventory));
    }, [inventory]);

    const handleAddItem = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newItem = {
            id: currentItem ? currentItem.id : crypto.randomUUID(),
            name: formData.get('name'),
            category: formData.get('category'),
            defaultUnit: formData.get('unit'),
            lastPrice: currentItem ? currentItem.lastPrice : 0,
            priceHistory: currentItem ? currentItem.priceHistory : [],
        };

        if (currentItem) {
            setItems(items.map(i => i.id === currentItem.id ? newItem : i));
        } else {
            setItems([...items, newItem]);
        }
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const updateInventory = (itemId, change) => {
        const existing = inventory.find(i => i.itemId === itemId);
        if (existing) {
            const newQty = Math.max(0, existing.quantity + change);
            if (newQty === 0) {
                setInventory(inventory.filter(i => i.itemId !== itemId));
            } else {
                setInventory(inventory.map(i => i.itemId === itemId ? { ...i, quantity: newQty } : i));
            }
        } else if (change > 0) {
            const item = items.find(i => i.id === itemId);
            setInventory([...inventory, { itemId, name: item.name, quantity: change, unit: item.defaultUnit }]);
        }
    };

    const startShopping = () => {
        setShoppingSession({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            items: [],
            total: 0
        });
        setActiveTab('shopping');
    };

    const completeShopping = () => {
        // Log expense, update inventory, update price history
        const newExpenses = JSON.parse(localStorage.getItem('nestora_expenses') || '[]');
        const shoppingExpense = {
            id: crypto.randomUUID(),
            title: `Grocery Shopping - ${new Date().toLocaleDateString()}`,
            amount: shoppingSession.total,
            category: 'Groceries',
            date: new Date().toISOString()
        };
        localStorage.setItem('nestora_expenses', JSON.stringify([shoppingExpense, ...newExpenses]));

        // Update inventory and prices
        let updatedInventory = [...inventory];
        let updatedItems = [...items];

        shoppingSession.items.forEach(sItem => {
            // Inventory
            const invIndex = updatedInventory.findIndex(i => i.itemId === sItem.itemId);
            if (invIndex !== -1) {
                updatedInventory[invIndex].quantity += sItem.quantity;
            } else {
                updatedInventory.push({ itemId: sItem.itemId, name: sItem.name, quantity: sItem.quantity, unit: sItem.unit });
            }

            // Price History
            const itemIndex = updatedItems.findIndex(i => i.id === sItem.itemId);
            if (itemIndex !== -1) {
                updatedItems[itemIndex].lastPrice = sItem.price;
                updatedItems[itemIndex].priceHistory.push({ date: new Date().toISOString(), price: sItem.price });
            }
        });

        setInventory(updatedInventory);
        setItems(updatedItems);
        setShoppingSession(null);
        setActiveTab('inventory');
        alert("Shopping completed! Inventory and expenses updated.");
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        if (location.state?.openAddModal) {
            navigate(-1);
        }
    };

    return (
        <div className="page groceries-page">

            <div className="segmented-control">
                <button className={`segment ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Inventory</button>
                <button className={`segment ${activeTab === 'master' ? 'active' : ''}`} onClick={() => setActiveTab('master')}>Master List</button>
                {shoppingSession && <button className={`segment ${activeTab === 'shopping' ? 'active' : ''}`} onClick={() => setActiveTab('shopping')}>Shopping</button>}
            </div>

            {activeTab === 'inventory' && (
                <div className="inventory-list">
                    {/* <button className="btn-secondary full-width" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => navigate('/chores', { state: { openAddModal: true } })}>
                        <CheckSquare size={18} /> Add Chore
                    </button> */}
                    {inventory.length === 0 ? (
                        <div className="empty-state"><Package size={48} color="#cbd5e1" /><p>Your inventory is empty.</p></div>
                    ) : (
                        inventory.map(item => (
                            <div key={item.itemId} className="inventory-card card">
                                <div className="info">
                                    <h3>{item.name}</h3>
                                    <p>{item.quantity} {item.unit}</p>
                                </div>
                                <div className="qty-controls">
                                    <button onClick={() => updateInventory(item.itemId, -1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateInventory(item.itemId, 1)}>+</button>
                                </div>
                            </div>
                        ))
                    )}
                    <button className="btn-primary full-width" style={{ marginTop: '20px' }} onClick={startShopping}>
                        <ShoppingCart size={20} /> Start Shopping Session
                    </button>
                </div>
            )}

            {activeTab === 'master' && (
                <div className="master-list">
                    {items.map(item => (
                        <div key={item.id} className="item-card card">
                            <div className="info">
                                <h3>{item.name}</h3>
                                <p>{item.category} • Last: ${item.lastPrice}</p>
                            </div>
                            <button className="btn-icon" onClick={() => { setCurrentItem(item); setIsModalOpen(true); }}>
                                <Edit2 size={18} color="#94a3b8" />
                            </button>
                        </div>
                    ))}
                    <button className="fab-add" onClick={() => setIsModalOpen(true)}>
                        <Plus size={24} color="white" />
                    </button>
                </div>
            )}

            {activeTab === 'shopping' && shoppingSession && (
                <div className="shopping-session">
                    <div className="session-card card">
                        <div className="session-header">
                            <h3>Current Session</h3>
                            <span className="total">${shoppingSession.total.toFixed(2)}</span>
                        </div>
                        <div className="shopping-items">
                            {items.map(item => (
                                <div key={item.id} className="shopping-row">
                                    <span>{item.name}</span>
                                    <div className="inputs">
                                        <input type="number" placeholder="Qty" onChange={(e) => {
                                            const qty = parseFloat(e.target.value) || 0;
                                            const price = parseFloat(document.getElementById(`price-${item.id}`).value) || 0;
                                            const sItems = [...shoppingSession.items.filter(si => si.itemId !== item.id)];
                                            if (qty > 0) sItems.push({ itemId: item.id, name: item.name, quantity: qty, price, unit: item.defaultUnit });
                                            const total = sItems.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
                                            setShoppingSession({ ...shoppingSession, items: sItems, total });
                                        }} />
                                        <input type="number" id={`price-${item.id}`} placeholder="Price" defaultValue={item.lastPrice} onChange={(e) => {
                                            const price = parseFloat(e.target.value) || 0;
                                            const qtyInput = e.target.previousSibling;
                                            const qty = parseFloat(qtyInput.value) || 0;
                                            const sItems = [...shoppingSession.items.filter(si => si.itemId !== item.id)];
                                            if (qty > 0) sItems.push({ itemId: item.id, name: item.name, quantity: qty, price, unit: item.defaultUnit });
                                            const total = sItems.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
                                            setShoppingSession({ ...shoppingSession, items: sItems, total });
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn-primary full-width" onClick={completeShopping}>Complete & Log Expense</button>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCancel}>
                    <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
                        <div className="sheet-handle"></div>
                        <h2>{currentItem ? 'Edit Item' : 'Add Master Item'}</h2>
                        <form onSubmit={handleAddItem}>
                            <div className="form-group">
                                <label>Item Name</label>
                                <input name="name" defaultValue={currentItem?.name} required placeholder="e.g. Milk" autoFocus />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" defaultValue={currentItem?.category || 'Dairy'}>
                                    <option value="Dairy">Dairy</option>
                                    <option value="Produce">Produce</option>
                                    <option value="Meat">Meat</option>
                                    <option value="Pantry">Pantry</option>
                                    <option value="Frozen">Frozen</option>
                                    <option value="Household">Household</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Default Unit</label>
                                <input name="unit" defaultValue={currentItem?.defaultUnit || 'pcs'} required placeholder="e.g. Liters, kg, pcs" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary full-width" onClick={handleCancel}>Cancel</button>
                                <button type="submit" className="btn-primary full-width">{currentItem ? 'Update' : 'Add Item'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groceries;
