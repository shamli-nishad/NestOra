import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, ShoppingBag, Package, ChevronRight, Check, Trash2, Edit2, ShoppingCart, CheckSquare } from 'lucide-react';
import { GROCERY_CATEGORIES, SHOP_LIST, UNIT_LIST } from '../../constants';
import { formatDate } from '../../utils/dateUtils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import BottomSheet from '../../components/UI/BottomSheet';
import SegmentedControl from '../../components/UI/SegmentedControl';
import './Groceries.css';

const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const Groceries = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inventory'); // inventory, shopping
    const [inventory, setInventory] = useLocalStorage('nestora_inventory', []);
    const [shoppingSessions, setShoppingSessions] = useLocalStorage('nestora_shopping_sessions', []);
    const [expenses, setExpenses] = useLocalStorage('nestora_expenses', []);
    const [shoppingSession, setShoppingSession] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [filterCategory, setFilterCategory] = useState('All');
    const [statusFilter, setStatusFilter] = useState('all'); // all, low

    const toggleCategory = (cat) => {
        setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const filteredInventory = inventory.filter(item => {
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        const threshold = item.lowStockThreshold !== undefined ? item.lowStockThreshold : 0;
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'low' && item.currentQuantity <= threshold);
        return matchesCategory && matchesStatus;
    });

    // Migration logic
    useEffect(() => {
        const oldMaster = localStorage.getItem('nestora_master_items');
        const oldInventory = localStorage.getItem('nestora_inventory');

        // If master exists and hasn't been merged (checking for currentQuantity field)
        if (oldMaster) {
            try {
                const masterItems = JSON.parse(oldMaster);
                const invItems = oldInventory ? JSON.parse(oldInventory) : [];

                // Check if already migrated
                if (masterItems.length > 0 && masterItems[0].currentQuantity === undefined) {
                    console.log("Migrating master list and inventory...");
                    const merged = masterItems.map(m => {
                        const inv = invItems.find(i => i.itemId === m.id);
                        return {
                            ...m,
                            currentQuantity: inv ? inv.quantity : 0,
                            priceHistory: m.priceHistory || []
                        };
                    });
                    setInventory(merged);
                    // Clear old master list key after migration
                    localStorage.removeItem('nestora_master_items');
                }
            } catch (e) {
                console.error("Migration failed", e);
            }
        }
    }, []);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setActiveTab('inventory');
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



    const handleAddItem = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newItem = {
            id: currentItem ? currentItem.id : generateUUID(),
            name: formData.get('name'),
            category: formData.get('category'),
            defaultUnit: formData.get('unit'),
            currentQuantity: currentItem ? currentItem.currentQuantity : 0,
            lowStockThreshold: parseInt(formData.get('threshold')) || 0,
            lastPrice: currentItem ? currentItem.lastPrice : 0,
            priceHistory: currentItem ? currentItem.priceHistory : [],
        };

        if (currentItem) {
            setInventory(inventory.map(i => i.id === currentItem.id ? newItem : i));
        } else {
            setInventory([...inventory, newItem]);
        }
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleDeleteItem = (id) => {
        if (window.confirm("Delete this item from Inventory?")) {
            setInventory(inventory.filter(i => i.id !== id));
        }
    };

    const updateQuantity = (itemId, change) => {
        setInventory(inventory.map(i => {
            if (i.id === itemId) {
                return { ...i, currentQuantity: Math.max(0, i.currentQuantity + change) };
            }
            return i;
        }));
    };

    const startShopping = () => {
        const newSession = {
            id: generateUUID(),
            date: new Date().toISOString(),
            status: 'planning',
            shopName: '',
            items: [] // { itemId, name, quantity, price, unit, isPlanned }
        };
        setShoppingSession(newSession);
        setActiveTab('shopping');
    };

    const savePlan = () => {
        if (!shoppingSession) {
            console.warn("No active shopping session to save.");
            return;
        }

        if (!shoppingSession.shopName) {
            alert("Please select or enter a shop name.");
            return;
        }

        setShoppingSessions(prev => {
            const existingIndex = prev.findIndex(s => s.id === shoppingSession.id);
            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = shoppingSession;
                return updated;
            }
            return [...prev, shoppingSession];
        });

        setShoppingSession(null);
        alert("Shopping plan saved!");
    };

    const deletePlan = (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this shopping plan?")) {
            setShoppingSessions(prev => prev.filter(s => s.id !== id));
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
        if (!shoppingSession) return;

        if (!shoppingSession.shopName) {
            alert("Please select or enter a shop name.");
            return;
        }
        if (shoppingSession.items.length === 0) {
            alert("Please select at least one item to plan.");
            return;
        }

        const updatedSession = { ...shoppingSession, status: 'active' };

        setShoppingSessions(prev => {
            const existingIndex = prev.findIndex(s => s.id === updatedSession.id);
            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = updatedSession;
                return updated;
            }
            return [...prev, updatedSession];
        });

        setShoppingSession(updatedSession);
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
        if (!shoppingSession) return;

        const shoppingExpense = {
            id: generateUUID(),
            title: `Grocery Shopping at ${shoppingSession.shopName}`,
            amount: shoppingSession.items.reduce((acc, curr) => acc + (curr.quantity * (curr.price || 0)), 0),
            category: 'Groceries',
            date: new Date().toISOString()
        };

        setExpenses(prev => [shoppingExpense, ...prev]);

        // Update inventory and prices
        setInventory(prevInv => {
            const updatedInventory = [...prevInv];
            shoppingSession.items.forEach(sItem => {
                const itemIndex = updatedInventory.findIndex(i => i.id === sItem.itemId);
                if (itemIndex !== -1) {
                    // Update quantity
                    updatedInventory[itemIndex].currentQuantity = (updatedInventory[itemIndex].currentQuantity || 0) + sItem.quantity;
                    // Update price info
                    updatedInventory[itemIndex].lastPrice = sItem.price;
                    if (!updatedInventory[itemIndex].priceHistory) updatedInventory[itemIndex].priceHistory = [];
                    updatedInventory[itemIndex].priceHistory.push({
                        date: new Date().toISOString(),
                        price: sItem.price
                    });
                }
            });
            return updatedInventory;
        });

        // Remove from shoppingSessions
        setShoppingSessions(prev => prev.filter(s => s.id !== shoppingSession.id));

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

            <SegmentedControl
                options={[
                    { value: 'inventory', label: 'Inventory' },
                    { value: 'shopping', label: 'Shopping' }
                ]}
                value={activeTab}
                onChange={setActiveTab}
            />

            {activeTab === 'inventory' && (
                <div className="inventory-list">
                    <div className="list-header">
                        <h3>Inventory Catalog</h3>
                        <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Add Item</button>
                    </div>

                    <div className="filter-bar card">
                        <div className="filter-group">
                            <label>Category</label>
                            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                <option value="All">All Categories</option>
                                {GROCERY_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Status</label>
                            <div className="status-toggles">
                                <button
                                    className={`status-btn ${statusFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`status-btn ${statusFilter === 'low' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('low')}
                                >
                                    Low Stock
                                </button>
                            </div>
                        </div>
                    </div>

                    {filteredInventory.length === 0 ? (
                        <div className="empty-state">
                            <Package size={48} color="#cbd5e1" />
                            <p>No items match your filters.</p>
                        </div>
                    ) : (
                        filteredInventory.map(item => (
                            <div key={item.id} className="inventory-card card">
                                <div className="info" onClick={() => { setCurrentItem(item); setIsModalOpen(true); }}>
                                    <h3>{item.name}</h3>
                                    <p>{item.category} • {item.currentQuantity} {item.defaultUnit} • ${item.lastPrice} {item.currentQuantity <= (item.lowStockThreshold || 0) && <span className="low-stock-alert">Low!</span>}</p>
                                </div>
                                <div className="card-controls">
                                    <div className="qty-controls">
                                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                        <span>{item.currentQuantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                    </div>
                                    <button className="btn-icon" onClick={() => handleDeleteItem(item.id)}>
                                        <Trash2 size={18} color="#ef4444" />
                                    </button>
                                </div>
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
                                                <p>{session.items.length} items • {formatDate(session.date)}</p>
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
                                <label>Browse Catalog</label>
                                <div className="categorized-selection">
                                    {GROCERY_CATEGORIES.map(cat => {
                                        const catItems = inventory.filter(i => i.category === cat);
                                        if (catItems.length === 0) return null;
                                        const isExpanded = expandedCategories[cat];

                                        return (
                                            <div key={cat} className={`category-group ${isExpanded ? 'expanded' : ''}`}>
                                                <div className="category-header" onClick={() => toggleCategory(cat)}>
                                                    <span>{cat}</span>
                                                    <ChevronRight size={16} className="arrow" />
                                                </div>
                                                {isExpanded && (
                                                    <div className="category-items">
                                                        {catItems.map(item => (
                                                            <div
                                                                key={item.id}
                                                                className={`selection-item ${shoppingSession.items.find(i => i.itemId === item.id) ? 'selected' : ''}`}
                                                                onClick={() => togglePlannedItem(item)}
                                                            >
                                                                <div className="item-info">
                                                                    <span className="name">{item.name}</span>
                                                                    <span className="stock">Stock: {item.currentQuantity}</span>
                                                                </div>
                                                                {shoppingSession.items.find(i => i.itemId === item.id) ? <Check size={16} color="#10b981" /> : <Plus size={16} color="#cbd5e1" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
                                        const item = inventory.find(i => i.id === e.target.value);
                                        if (item) addItemOnTheGo(item);
                                        e.target.value = "";
                                    }}
                                    className="on-the-go-select"
                                >
                                    <option value="">-- Add Item --</option>
                                    {inventory.filter(item => !shoppingSession.items.find(si => si.itemId === item.id)).map(item => (
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

            <BottomSheet
                isOpen={isModalOpen}
                onClose={handleCancel}
                title={currentItem ? 'Edit Item' : 'Add Item to Inventory'}
            >
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
                    <div className="form-row">
                        <div className="form-group">
                            <label>Default Unit</label>
                            <select name="unit" defaultValue={currentItem?.defaultUnit || 'pcs'}>
                                {UNIT_LIST.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Low Stock Alert At</label>
                            <input type="number" name="threshold" defaultValue={currentItem?.lowStockThreshold || 0} min="0" />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary full-width" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="btn-primary full-width">{currentItem ? 'Update' : 'Add Item'}</button>
                    </div>
                </form>
            </BottomSheet>
        </div>
    );
};

export default Groceries;
