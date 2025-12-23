import React, { useState, useEffect } from 'react';
import { Plus, ShoppingBag, Package, TrendingUp, Trash2, Edit2, Check } from 'lucide-react';
import './Groceries.css';

const Groceries = () => {
    const [activeTab, setActiveTab] = useState('inventory'); // inventory, items, shopping
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('nestora_master_items');
        return saved ? JSON.parse(saved) : [];
    });
    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('nestora_inventory');
        return saved ? JSON.parse(saved) : [];
    });
    const [shoppingSession, setShoppingSession] = useState(null);
    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('nestora_expenses');
        return saved ? JSON.parse(saved) : [];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        localStorage.setItem('nestora_master_items', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        localStorage.setItem('nestora_inventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('nestora_expenses', JSON.stringify(expenses));
    }, [expenses]);

    const handleAddItem = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newItem = {
            id: currentItem ? currentItem.id : crypto.randomUUID(),
            name: formData.get('name'),
            category: formData.get('category'),
            defaultUnit: formData.get('defaultUnit'),
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

    const addToInventory = (item) => {
        const existing = inventory.find(i => i.itemId === item.id);
        if (existing) {
            setInventory(inventory.map(i => i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setInventory([...inventory, { id: crypto.randomUUID(), itemId: item.id, quantity: 1, unit: item.defaultUnit }]);
        }
    };

    const updateInventoryQty = (id, delta) => {
        setInventory(inventory.map(i => {
            if (i.id === id) {
                const newQty = Math.max(0, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }).filter(i => i.quantity > 0));
    };

    const startShopping = () => {
        setShoppingSession({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            items: [],
            totalAmount: 0,
            store: ''
        });
        setActiveTab('shopping');
    };

    const addToShopping = (item) => {
        if (!shoppingSession) {
            setShoppingSession({
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                items: [{ itemId: item.id, name: item.name, quantity: 1, pricePaid: 0, isPurchased: false }],
                totalAmount: 0,
                store: ''
            });
            setActiveTab('shopping');
            return;
        }
        const existing = shoppingSession.items.find(i => i.itemId === item.id);
        if (existing) return;

        setShoppingSession({
            ...shoppingSession,
            items: [...shoppingSession.items, { itemId: item.id, name: item.name, quantity: 1, pricePaid: 0, isPurchased: false }]
        });
    };

    const updateShoppingItem = (itemId, field, value) => {
        const updatedItems = shoppingSession.items.map(i =>
            i.itemId === itemId ? { ...i, [field]: value } : i
        );
        const total = updatedItems.reduce((sum, i) => sum + (i.isPurchased ? (i.pricePaid * i.quantity) : 0), 0);
        setShoppingSession({ ...shoppingSession, items: updatedItems, totalAmount: total });
    };

    const completeShopping = () => {
        if (shoppingSession.totalAmount > 0) {
            // 1. Log Expense
            const newExpense = {
                id: crypto.randomUUID(),
                amount: shoppingSession.totalAmount,
                date: new Date().toISOString(),
                category: 'Groceries',
                sourceType: 'shopping',
                sourceId: shoppingSession.id,
                description: `Shopping at ${shoppingSession.store || 'Store'}`
            };
            setExpenses([...expenses, newExpense]);

            // 2. Update Inventory & Price History
            let updatedInventory = [...inventory];
            let updatedItems = [...items];

            shoppingSession.items.forEach(si => {
                if (si.isPurchased) {
                    // Update Inventory
                    const invIndex = updatedInventory.findIndex(i => i.itemId === si.itemId);
                    if (invIndex !== -1) {
                        updatedInventory[invIndex].quantity += si.quantity;
                    } else {
                        updatedInventory.push({ id: crypto.randomUUID(), itemId: si.itemId, quantity: si.quantity, unit: items.find(i => i.id === si.itemId)?.defaultUnit });
                    }

                    // Update Price History
                    const itemIndex = updatedItems.findIndex(i => i.id === si.itemId);
                    if (itemIndex !== -1) {
                        const priceEntry = { price: si.pricePaid, date: new Date().toISOString(), store: shoppingSession.store };
                        updatedItems[itemIndex].priceHistory = [priceEntry, ...(updatedItems[itemIndex].priceHistory || [])].slice(0, 5);
                    }
                }
            });

            setInventory(updatedInventory);
            setItems(updatedItems);
            alert(`Shopping completed! Expense of $${shoppingSession.totalAmount.toFixed(2)} logged.`);
        }
        setShoppingSession(null);
        setActiveTab('inventory');
    };

    return (
        <div className="page groceries-page">
            <div className="page-header">
                <div>
                    <h1>Groceries & Inventory</h1>
                    <p>Manage your pantry and track price changes</p>
                </div>
                <div className="header-actions">
                    <div className="tabs">
                        <button className={`tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Inventory</button>
                        <button className={`tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>Master Items</button>
                        <button className={`tab ${activeTab === 'shopping' ? 'active' : ''}`} onClick={() => setActiveTab('shopping')}>Shopping</button>
                    </div>
                    {activeTab === 'items' && (
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                            <Plus size={20} />
                            <span>Add Item</span>
                        </button>
                    )}
                    {activeTab === 'shopping' && !shoppingSession && (
                        <button className="btn btn-primary" onClick={startShopping}>
                            <ShoppingBag size={20} />
                            <span>Start Session</span>
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'inventory' && (
                <div className="inventory-list">
                    {inventory.length === 0 ? (
                        <div className="empty-state"><Package size={48} /><p>Inventory is empty.</p></div>
                    ) : (
                        <div className="grid">
                            {inventory.map(inv => {
                                const item = items.find(i => i.id === inv.itemId);
                                return (
                                    <div key={inv.id} className="card inventory-card">
                                        <div className="card-info">
                                            <h3>{item?.name || 'Unknown Item'}</h3>
                                            <span className="tag">{item?.category}</span>
                                            {item?.priceHistory?.length > 0 && (
                                                <p className="price-hint">Last: ${item.priceHistory[0].price}</p>
                                            )}
                                        </div>
                                        <div className="qty-controls">
                                            <button onClick={() => updateInventoryQty(inv.id, -1)}>-</button>
                                            <span>{inv.quantity} {inv.unit}</span>
                                            <button onClick={() => updateInventoryQty(inv.id, 1)}>+</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'items' && (
                <div className="items-list">
                    <div className="grid">
                        {items.map(item => (
                            <div key={item.id} className="card item-card">
                                <div className="card-info">
                                    <h3>{item.name}</h3>
                                    <p>{item.category} • {item.defaultUnit}</p>
                                    {item.priceHistory?.length > 1 && (
                                        <div className="price-trend">
                                            <TrendingUp size={14} />
                                            <span>Trend: ${item.priceHistory[1].price} → ${item.priceHistory[0].price}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="card-actions">
                                    <button className="btn-icon" onClick={() => addToInventory(item)} title="Add to Inventory"><Plus size={18} /></button>
                                    <button className="btn-icon" onClick={() => addToShopping(item)} title="Add to Shopping"><ShoppingBag size={18} /></button>
                                    <button className="btn-icon" onClick={() => { setCurrentItem(item); setIsModalOpen(true); }}><Edit2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'shopping' && (
                <div className="shopping-section">
                    {!shoppingSession ? (
                        <div className="empty-state">
                            <ShoppingBag size={48} />
                            <p>No active shopping session. Start one to track prices and inventory.</p>
                            <button className="btn btn-primary" onClick={startShopping}>Start Shopping Session</button>
                        </div>
                    ) : (
                        <div className="shopping-session-card">
                            <div className="session-header">
                                <input
                                    type="text"
                                    placeholder="Store Name (e.g. Costco)"
                                    value={shoppingSession.store}
                                    onChange={(e) => setShoppingSession({ ...shoppingSession, store: e.target.value })}
                                />
                                <div className="total">Total: ${shoppingSession.totalAmount.toFixed(2)}</div>
                            </div>
                            <div className="shopping-items">
                                {shoppingSession.items.length === 0 ? (
                                    <p className="hint">Add items from the "Master Items" tab.</p>
                                ) : (
                                    shoppingSession.items.map(si => (
                                        <div key={si.itemId} className="shopping-item-row">
                                            <input
                                                type="checkbox"
                                                checked={si.isPurchased}
                                                onChange={(e) => updateShoppingItem(si.itemId, 'isPurchased', e.target.checked)}
                                            />
                                            <span className="name">{si.name}</span>
                                            <div className="inputs">
                                                <input
                                                    type="number"
                                                    placeholder="Qty"
                                                    value={si.quantity}
                                                    onChange={(e) => updateShoppingItem(si.itemId, 'quantity', parseFloat(e.target.value))}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Price"
                                                    value={si.pricePaid}
                                                    onChange={(e) => updateShoppingItem(si.itemId, 'pricePaid', parseFloat(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="session-footer">
                                <button className="btn" onClick={() => setShoppingSession(null)}>Cancel</button>
                                <button className="btn btn-primary" onClick={completeShopping}>Complete & Log Expense</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{currentItem ? 'Edit Item' : 'Add New Master Item'}</h2>
                        <form onSubmit={handleAddItem}>
                            <div className="form-group">
                                <label>Item Name</label>
                                <input name="name" defaultValue={currentItem?.name} required placeholder="e.g. Milk" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select name="category" defaultValue={currentItem?.category || 'Dairy'}>
                                        <option>Dairy</option>
                                        <option>Produce</option>
                                        <option>Meat</option>
                                        <option>Pantry</option>
                                        <option>Frozen</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Default Unit</label>
                                    <input name="defaultUnit" defaultValue={currentItem?.defaultUnit || 'pcs'} required placeholder="e.g. liters, kg, pcs" />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => { setIsModalOpen(false); setCurrentItem(null); }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{currentItem ? 'Update' : 'Add'} Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groceries;
