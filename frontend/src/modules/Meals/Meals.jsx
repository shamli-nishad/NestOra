import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Utensils, History, Check, Trash2, Edit2, ChevronRight, Clock, Users } from 'lucide-react';
import './Meals.css';

const Meals = () => {
    const location = useLocation();
    const navigate = useNavigate();
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
        if (location.state?.openAddModal) {
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        localStorage.setItem('nestora_recipes', JSON.stringify(recipes));
    }, [recipes]);

    useEffect(() => {
        localStorage.setItem('nestora_cooking_history', JSON.stringify(history));
    }, [history]);

    const handleAddRecipe = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newRecipe = {
            id: currentRecipe ? currentRecipe.id : crypto.randomUUID(),
            title: formData.get('title'),
            cookTime: formData.get('cookTime'),
            servings: formData.get('servings') || 2,
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
        const historyEntry = {
            id: crypto.randomUUID(),
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            date: new Date().toISOString(),
        };
        setHistory([historyEntry, ...history]);

        // Reduce inventory
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
        localStorage.setItem('nestora_inventory', JSON.stringify(updatedInventory.filter(i => i.quantity > 0)));

        alert(`Marked "${recipe.title}" as cooked. Inventory updated!`);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setCurrentRecipe(null);
        if (location.state?.openAddModal) {
            navigate(-1);
        }
    };

    return (
        <div className="page meals-page">

            <div className="segmented-control">
                <button className={`segment ${activeTab === 'recipes' ? 'active' : ''}`} onClick={() => setActiveTab('recipes')}>Recipes</button>
                <button className={`segment ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
            </div>

            {activeTab === 'recipes' && (
                <div className="recipe-list">
                    {recipes.length === 0 ? (
                        <div className="empty-state"><Utensils size={48} color="#cbd5e1" /><p>No recipes yet.</p></div>
                    ) : (
                        recipes.map(recipe => (
                            <div key={recipe.id} className="recipe-card card">
                                <div className="recipe-info">
                                    <h3>{recipe.title}</h3>
                                    <div className="meta">
                                        <span><Clock size={14} /> {recipe.cookTime}m</span>
                                        <span><Users size={14} /> {recipe.servings} servings</span>
                                    </div>
                                    <div className="ingredients-preview">
                                        {recipe.ingredients.slice(0, 3).map((ing, i) => (
                                            <span key={i} className="ing-tag">{ing.name}</span>
                                        ))}
                                        {recipe.ingredients.length > 3 && <span className="more">+{recipe.ingredients.length - 3}</span>}
                                    </div>
                                </div>
                                <div className="recipe-actions">
                                    <button className="btn-success-sm" onClick={() => markAsCooked(recipe)}>
                                        <Check size={16} /> Cooked
                                    </button>
                                    <button className="btn-icon" onClick={() => { setCurrentRecipe(recipe); setIsModalOpen(true); }}>
                                        <Edit2 size={18} color="#94a3b8" />
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

            {activeTab === 'history' && (
                <div className="history-list">
                    {history.map(entry => (
                        <div key={entry.id} className="history-item card">
                            <div className="info">
                                <h3>{entry.recipeTitle}</h3>
                                <p>{new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCancel}>
                    <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
                        <div className="sheet-handle"></div>
                        <h2>{currentRecipe ? 'Edit Recipe' : 'Add New Recipe'}</h2>
                        <form onSubmit={handleAddRecipe}>
                            <div className="form-group">
                                <label>Recipe Title</label>
                                <input name="title" defaultValue={currentRecipe?.title} required placeholder="e.g. Pasta Carbonara" autoFocus />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Cook Time (m)</label>
                                    <input type="number" name="cookTime" defaultValue={currentRecipe?.cookTime || 30} required />
                                </div>
                                <div className="form-group">
                                    <label>Servings</label>
                                    <input type="number" name="servings" defaultValue={currentRecipe?.servings || 2} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Steps (one per line)</label>
                                <textarea name="steps" defaultValue={currentRecipe?.steps.join('\n')} rows="4" placeholder="1. Boil water..."></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary full-width" onClick={handleCancel}>Cancel</button>
                                <button type="submit" className="btn-primary full-width">{currentRecipe ? 'Update' : 'Create Recipe'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meals;
