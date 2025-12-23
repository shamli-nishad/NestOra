import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, ShoppingBag, Package, ChevronRight, Check, Trash2, Edit2, ShoppingCart, CheckSquare } from 'lucide-react';
import './Groceries.css';
import { GROCERY_CATEGORIES, SHOP_LIST, UNIT_LIST } from './constants';

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
    const [shoppingSessions, setShoppingSessions] = useState(() => {
        const saved = localStorage.getItem('nestora_shopping_sessions');
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
        if (location.state?.openPlanModal) {
            setActiveTab('shopping');
            startShopping();
            window.history.replaceState({}, document.title);
        }
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        localStorage.setItem('nestora_master_items', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        localStorage.setItem('nestora_inventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('nestora_shopping_sessions', JSON.stringify(shoppingSessions));
    }, [shoppingSessions]);

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
        const newSession = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            status: 'planning',
            shopName: '',
            items: [] // { itemId, name, quantity, price, unit, isPlanned }
        };
        setShoppingSession(newSession);
        setActiveTab('shopping');
    };

    const savePlan = () => {
        if (!shoppingSession.shopName) {
            alert("Please select or enter a shop name.");
            return;
        }
        const existingIndex = shoppingSessions.findIndex(s => s.id === shoppingSession.id);
        if (existingIndex !== -1) {
            const updated = [...shoppingSessions];
            updated[existingIndex] = shoppingSession;
            setShoppingSessions(updated);
        } else {
            setShoppingSessions([...shoppingSessions, shoppingSession]);
        }
        setShoppingSession(null);
    };

    const deletePlan = (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this shopping plan?")) {
            setShoppingSessions(shoppingSessions.filter(s => s.id !== id));
        }
    };

    const togglePlannedItem = (item) => {
        const exists = shoppingSession.items.find(i => i.itemId === item.id);
        if (exists) {
            setShoppingSession({
                ...shoppingSession,
                items: shoppingSession.items.filter(i => i.itemId !== item.id)
            });
        } else {
            setShoppingSession({
                ...shoppingSession,
                items: [...shoppingSession.items, {
                    itemId: item.id,
                    name: item.name,
                    quantity: 1,
                    price: item.lastPrice || 0,
                    unit: item.defaultUnit,
                    isPlanned: true
                }]
            });
        }
    };

    const startExecution = () => {
        if (!shoppingSession.shopName) {
            alert("Please select or enter a shop name.");
            return;
        }
        if (shoppingSession.items.length === 0) {
            alert("Please select at least one item to plan.");
            return;
        }
        const updatedSession = { ...shoppingSession, status: 'active' };
        setShoppingSession(updatedSession);

        // Also update in the list if it exists
        const existingIndex = shoppingSessions.findIndex(s => s.id === shoppingSession.id);
        if (existingIndex !== -1) {
            const updated = [...shoppingSessions];
            updated[existingIndex] = updatedSession;
            setShoppingSessions(updated);
        } else {
            setShoppingSessions([...shoppingSessions, updatedSession]);
        }
    };

    const addItemOnTheGo = (item) => {
        const exists = shoppingSession.items.find(i => i.itemId === item.id);
        if (exists) return;
        const updatedSession = {
            ...shoppingSession,
            items: [...shoppingSession.items, {
                itemId: item.id,
                name: item.name,
                quantity: 1,
                price: item.lastPrice || 0,
                unit: item.defaultUnit,
                isPlanned: false
            }]
        };
        setShoppingSession(updatedSession);

        // Sync with sessions list
        const existingIndex = shoppingSessions.findIndex(s => s.id === shoppingSession.id);
        if (existingIndex !== -1) {
            const updated = [...shoppingSessions];
            updated[existingIndex] = updatedSession;
            setShoppingSessions(updated);
        }
    };

    const completeShopping = () => {
        // Log expense, update inventory, update price history
        const newExpenses = JSON.parse(localStorage.getItem('nestora_expenses') || '[]');
        const shoppingExpense = {
            id: crypto.randomUUID(),
            title: `Grocery Shopping at ${shoppingSession.shopName}`,
            amount: shoppingSession.items.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0),
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
                if (!updatedItems[itemIndex].priceHistory) updatedItems[itemIndex].priceHistory = [];
                updatedItems[itemIndex].priceHistory.push({ date: new Date().toISOString(), price: sItem.price });
            }
        });

        // Remove from shoppingSessions
        setShoppingSessions(shoppingSessions.filter(s => s.id !== shoppingSession.id));

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
                <button className={`segment ${activeTab === 'shopping' ? 'active' : ''}`} onClick={() => setActiveTab('shopping')}>Shopping</button>
            </div>

            {activeTab === 'inventory' && (
                <div className="inventory-list">
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
                </div>
            )}

            {activeTab === 'master' && (
                <div className="master-list">
                    <div className="list-header">
                        <h3>Master List</h3>
                        <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Add Item</button>
                    </div>
                    {items.length === 0 ? (
                        <div className="empty-state">
                            <Package size={48} color="#cbd5e1" />
                            <p>Your master list is empty.</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="item-card card">
                                <div className="info">
                                    <h3>{item.name}</h3>
                                    <p>{item.category} • Last: ${item.lastPrice}</p>
                                </div>
                                <button className="btn-icon" onClick={() => { setCurrentItem(item); setIsModalOpen(true); }}>
                                    <Edit2 size={18} color="#94a3b8" />
                                </button>
                            </div>
                        ))
                    )}
                    <button className="fab-add" onClick={() => setIsModalOpen(true)}>
                        <Plus size={24} color="white" />
                    </button>
                </div>
            )}

            {activeTab === 'shopping' && (
                <div className="shopping-session">
                    {!shoppingSession ? (
                        <div className="sessions-list">
                            <div className="list-header">
                                <h3>Shopping Plans</h3>
                                <button className="btn-primary" onClick={startShopping}><Plus size={18} /> New Plan</button>
                            </div>
                            {shoppingSessions.length === 0 ? (
                                <div className="empty-state">
                                    <ShoppingCart size={48} color="#cbd5e1" />
                                    <p>No saved shopping plans.</p>
                                </div>
                            ) : (
                                <div className="sessions-grid">
                                    {shoppingSessions.map(session => (
                                        <div key={session.id} className="session-item card" onClick={() => setShoppingSession(session)}>
                                            <div className="info">
                                                <div className="shop-info">
                                                    <ShoppingBag size={18} color="var(--primary)" />
                                                    <h4>{session.shopName || 'Unnamed Plan'}</h4>
                                                </div>
                                                <p>{session.items.length} items • {new Date(session.date).toLocaleDateString()}</p>
                                                <span className={`status-badge ${session.status}`}>{session.status === 'active' ? 'In Progress' : 'Planned'}</span>
                                            </div>
                                            <button className="btn-icon delete-btn" onClick={(e) => deletePlan(session.id, e)}>
                                                <Trash2 size={18} color="#ef4444" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : shoppingSession.status === 'planning' ? (
                        <div className="planning-view card">
                            <div className="session-header">
                                <h3>Plan Shopping</h3>
                            </div>
                            <div className="form-group">
                                <label>Select Shop</label>
                                <select
                                    value={shoppingSession.shopName}
                                    onChange={(e) => setShoppingSession({ ...shoppingSession, shopName: e.target.value })}
                                    className="shop-select"
                                >
                                    <option value="">-- Select a Shop --</option>
                                    {SHOP_LIST.map(shop => (
                                        <option key={shop} value={shop}>{shop}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="item-selection">
                                <label>Select Items</label>
                                <div className="selection-list">
                                    {items.map(item => (
                                        <div
                                            key={item.id}
                                            className={`selection-item ${shoppingSession.items.find(i => i.itemId === item.id) ? 'selected' : ''}`}
                                            onClick={() => togglePlannedItem(item)}
                                        >
                                            <span>{item.name}</span>
                                            {shoppingSession.items.find(i => i.itemId === item.id) ? <Check size={16} color="#10b981" /> : <Plus size={16} color="#cbd5e1" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary full-width" onClick={() => setShoppingSession(null)}>Cancel</button>
                                <button className="btn-secondary full-width" onClick={savePlan}>Save Plan</button>
                                <button className="btn-primary full-width" onClick={startExecution}>Start Shopping</button>
                            </div>
                        </div>
                    ) : (
                        <div className="execution-view card">
                            <div className="session-header">
                                <div>
                                    <h3>Shopping at {shoppingSession.shopName}</h3>
                                    <p className="text-muted">{shoppingSession.items.length} items</p>
                                </div>
                                <span className="total">${shoppingSession.items.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0).toFixed(2)}</span>
                            </div>
                            <div className="shopping-items">
                                {shoppingSession.items.map(sItem => (
                                    <div key={sItem.itemId} className="shopping-row">
                                        <div className="item-meta">
                                            <span className="name">{sItem.name}</span>
                                            {!sItem.isPlanned && <span className="on-the-go-badge">On the go</span>}
                                        </div>
                                        <div className="inputs">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                value={sItem.quantity}
                                                onChange={(e) => {
                                                    const qty = parseFloat(e.target.value) || 0;
                                                    const updatedSession = {
                                                        ...shoppingSession,
                                                        items: shoppingSession.items.map(i => i.itemId === sItem.itemId ? { ...i, quantity: qty } : i)
                                                    };
                                                    setShoppingSession(updatedSession);
                                                    // Sync with sessions list
                                                    const existingIndex = shoppingSessions.findIndex(s => s.id === shoppingSession.id);
                                                    if (existingIndex !== -1) {
                                                        const updated = [...shoppingSessions];
                                                        updated[existingIndex] = updatedSession;
                                                        setShoppingSessions(updated);
                                                    }
                                                }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={sItem.price}
                                                onChange={(e) => {
                                                    const price = parseFloat(e.target.value) || 0;
                                                    const updatedSession = {
                                                        ...shoppingSession,
                                                        items: shoppingSession.items.map(i => i.itemId === sItem.itemId ? { ...i, price: price } : i)
                                                    };
                                                    setShoppingSession(updatedSession);
                                                    // Sync with sessions list
                                                    const existingIndex = shoppingSessions.findIndex(s => s.id === shoppingSession.id);
                                                    if (existingIndex !== -1) {
                                                        const updated = [...shoppingSessions];
                                                        updated[existingIndex] = updatedSession;
                                                        setShoppingSessions(updated);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="add-on-the-go">
                                <label>Add item on the go</label>
                                <select
                                    onChange={(e) => {
                                        const item = items.find(i => i.id === e.target.value);
                                        if (item) addItemOnTheGo(item);
                                        e.target.value = "";
                                    }}
                                    className="on-the-go-select"
                                >
                                    <option value="">-- Add Item --</option>
                                    {items.filter(item => !shoppingSession.items.find(si => si.itemId === item.id)).map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '20px' }}>
                                <button className="btn-secondary full-width" onClick={() => setShoppingSession(null)}>Close</button>
                                <button className="btn-secondary full-width" onClick={() => setShoppingSession({ ...shoppingSession, status: 'planning' })}>Back to Plan</button>
                                <button className="btn-primary full-width" onClick={completeShopping}>Complete & Log</button>
                            </div>
                        </div>
                    )}
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
                                <select name="category" defaultValue={currentItem?.category || GROCERY_CATEGORIES[0]}>
                                    {GROCERY_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Default Unit</label>
                                <select name="unit" defaultValue={currentItem?.defaultUnit || 'pcs'}>
                                    {UNIT_LIST.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
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
