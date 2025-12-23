import React, { useState, useEffect } from 'react';
import { Plus, Utensils, History, Check, Trash2, Edit2, ChevronRight } from 'lucide-react';
import './Meals.css';

const Meals = () => {
    const [activeTab, setActiveTab] = useState('recipes'); // recipes, history
    const [recipes, setRecipes] = useState(() => {
        const saved = localStorage.getItem('nestora_recipes');
        return saved ? JSON.parse(saved) : [];
    });
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('nestora_cooking_history');
        return saved ? JSON.parse(saved) : [];
    });
    const [masterItems] = useState(() => {
        const saved = localStorage.getItem('nestora_master_items');
        return saved ? JSON.parse(saved) : [];
    });
    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('nestora_inventory');
        return saved ? JSON.parse(saved) : [];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState(null);

    useEffect(() => {
        localStorage.setItem('nestora_recipes', JSON.stringify(recipes));
    }, [recipes]);

    useEffect(() => {
        localStorage.setItem('nestora_cooking_history', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        localStorage.setItem('nestora_inventory', JSON.stringify(inventory));
    }, [inventory]);

    const handleAddRecipe = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newRecipe = {
            id: currentRecipe ? currentRecipe.id : crypto.randomUUID(),
            title: formData.get('title'),
            cookTime: formData.get('cookTime'),
            ingredients: currentRecipe ? currentRecipe.ingredients : [],
            steps: formData.get('steps').split('\n').filter(s => s.trim()),
            createdAt: currentRecipe ? currentRecipe.createdAt : new Date().toISOString(),
        };

        if (currentRecipe) {
            setRecipes(recipes.map(r => r.id === currentRecipe.id ? newRecipe : r));
        } else {
            setRecipes([...recipes, newRecipe]);
        }
        setIsModalOpen(false);
        setCurrentRecipe(null);
    };

    const markAsCooked = (recipe) => {
        // 1. Log to history
        const historyEntry = {
            id: crypto.randomUUID(),
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            date: new Date().toISOString(),
        };
        setHistory([historyEntry, ...history]);

        // 2. Reduce inventory (simplified logic: reduce 1 unit for each ingredient if exists)
        let updatedInventory = [...inventory];
        recipe.ingredients.forEach(ing => {
            const invIndex = updatedInventory.findIndex(i => i.itemId === ing.itemId);
            if (invIndex !== -1) {
                updatedInventory[invIndex] = {
                    ...updatedInventory[invIndex],
                    quantity: Math.max(0, updatedInventory[invIndex].quantity - ing.quantity)
                };
            }
        });
        setInventory(updatedInventory.filter(i => i.quantity > 0));

        alert(`Marked "${recipe.title}" as cooked. Inventory updated!`);
    };

    const addIngredient = (recipeId, itemId, quantity) => {
        const item = masterItems.find(i => i.id === itemId);
        if (!item) return;

        setRecipes(recipes.map(r => {
            if (r.id === recipeId) {
                return {
                    ...r,
                    ingredients: [...r.ingredients, { itemId, name: item.name, quantity, unit: item.defaultUnit }]
                };
            }
            return r;
        }));
    };

    return (
        <div className="page meals-page">
            <div className="page-header">
                <div>
                    <h1>Meal Planning & Recipes</h1>
                    <p>Plan your meals and track what you cook</p>
                </div>
                <div className="header-actions">
                    <div className="tabs">
                        <button className={`tab ${activeTab === 'recipes' ? 'active' : ''}`} onClick={() => setActiveTab('recipes')}>Recipes</button>
                        <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Cooking History</button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        <span>Add Recipe</span>
                    </button>
                </div>
            </div>

            {activeTab === 'recipes' && (
                <div className="recipes-grid">
                    {recipes.length === 0 ? (
                        <div className="empty-state"><Utensils size={48} /><p>No recipes yet. Add your first one!</p></div>
                    ) : (
                        recipes.map(recipe => (
                            <div key={recipe.id} className="recipe-card">
                                <div className="recipe-info">
                                    <h3>{recipe.title}</h3>
                                    <p className="meta">{recipe.cookTime} mins • {recipe.ingredients.length} ingredients</p>
                                    <div className="recipe-ingredients">
                                        {recipe.ingredients.slice(0, 3).map((ing, i) => (
                                            <span key={i} className="ing-tag">{ing.name}</span>
                                        ))}
                                        {recipe.ingredients.length > 3 && <span>+{recipe.ingredients.length - 3} more</span>}
                                    </div>
                                </div>
                                <div className="recipe-actions">
                                    <button className="btn btn-success btn-sm" onClick={() => markAsCooked(recipe)}>
                                        <Check size={16} /> Mark Cooked
                                    </button>
                                    <button className="btn-icon" onClick={() => { setCurrentRecipe(recipe); setIsModalOpen(true); }}><Edit2 size={18} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="history-list">
                    {history.length === 0 ? (
                        <div className="empty-state"><History size={48} /><p>No cooking history yet.</p></div>
                    ) : (
                        history.map(entry => (
                            <div key={entry.id} className="history-item">
                                <div className="history-info">
                                    <strong>{entry.recipeTitle}</strong>
                                    <span>{new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <ChevronRight size={20} className="text-muted" />
                            </div>
                        ))
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{currentRecipe ? 'Edit Recipe' : 'Add New Recipe'}</h2>
                        <form onSubmit={handleAddRecipe}>
                            <div className="form-group">
                                <label>Recipe Title</label>
                                <input name="title" defaultValue={currentRecipe?.title} required placeholder="e.g. Chicken Stir Fry" />
                            </div>
                            <div className="form-group">
                                <label>Cook Time (minutes)</label>
                                <input type="number" name="cookTime" defaultValue={currentRecipe?.cookTime || 30} required />
                            </div>
                            <div className="form-group">
                                <label>Steps (one per line)</label>
                                <textarea name="steps" defaultValue={currentRecipe?.steps.join('\n')} rows="4" placeholder="1. Cut chicken..."></textarea>
                            </div>

                            {!currentRecipe && (
                                <p className="hint">You can add ingredients after creating the recipe.</p>
                            )}

                            {currentRecipe && (
                                <div className="ingredient-manager">
                                    <label>Ingredients</label>
                                    <div className="ingredient-list">
                                        {currentRecipe.ingredients.map((ing, i) => (
                                            <div key={i} className="ing-row">
                                                <span>{ing.name}</span>
                                                <span>{ing.quantity} {ing.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="add-ing-form">
                                        <select id="ing-select">
                                            <option value="">Select Item...</option>
                                            {masterItems.map(item => (
                                                <option key={item.id} value={item.id}>{item.name}</option>
                                            ))}
                                        </select>
                                        <input type="number" id="ing-qty" placeholder="Qty" style={{ width: '60px' }} />
                                        <button type="button" onClick={() => {
                                            const itemId = document.getElementById('ing-select').value;
                                            const qty = document.getElementById('ing-qty').value;
                                            if (itemId && qty) addIngredient(currentRecipe.id, itemId, parseFloat(qty));
                                        }}>Add</button>
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => { setIsModalOpen(false); setCurrentRecipe(null); }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{currentRecipe ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meals;
