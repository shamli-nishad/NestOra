import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Utensils, History, Check, Trash2, Edit2, ChevronRight, Clock, Users, Timer, Info, Flame, CookingPot, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { MEAL_TYPES } from '../../constants';
import { formatDate, formatDateTime, getLocalDateTimeForInput } from '../../utils/dateUtils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import BottomSheet from '../../components/UI/BottomSheet';
import SegmentedControl from '../../components/UI/SegmentedControl';
import './Meals.css';

const Meals = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('plan'); // plan, recipes, history
    const [recipes, setRecipes] = useLocalStorage('nestora_recipes', []);
    const [history, setHistory] = useLocalStorage('nestora_cooking_history', []);
    const [mealPlans, setMealPlans] = useLocalStorage('nestora_meal_plans', []);
    const [masterItems] = useLocalStorage('nestora_master_items', []);
    const [inventory, setInventory] = useLocalStorage('nestora_inventory', []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState(null);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [selectedMealTypes, setSelectedMealTypes] = useState([]);
    const [earlyPrep, setEarlyPrep] = useState(false);
    const [isCookModalOpen, setIsCookModalOpen] = useState(false);
    const [recipeToCook, setRecipeToCook] = useState(null);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [currentPlanItem, setCurrentPlanItem] = useState(null);

    useEffect(() => {
        if (currentRecipe) {
            setSelectedIngredients(currentRecipe.ingredients || []);
            setSelectedMealTypes(currentRecipe.mealTypes || []);
            setEarlyPrep(currentRecipe.earlyPrep || false);
        } else {
            setSelectedIngredients([]);
            setSelectedMealTypes([]);
            setEarlyPrep(false);
        }
    }, [currentRecipe]);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);



    const handleAddRecipe = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newRecipe = {
            id: currentRecipe ? currentRecipe.id : crypto.randomUUID(),
            title: formData.get('title'),
            cookTime: formData.get('cookTime'),
            calories: formData.get('calories'),
            ingredients: selectedIngredients,
            mealTypes: selectedMealTypes,
            earlyPrep: earlyPrep,
            earlyPrepSteps: earlyPrep ? formData.get('earlyPrepSteps') : '',
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
        setSelectedIngredients([]);
        setSelectedMealTypes([]);
        setEarlyPrep(false);
    };

    const handleDeleteRecipe = (id, e) => {
        if (e) e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this recipe?")) {
            setRecipes(recipes.filter(r => r.id !== id));
            setIsModalOpen(false);
            setCurrentRecipe(null);
        }
    };

    const addIngredient = (itemId) => {
        const item = masterItems.find(i => i.id === itemId);
        if (item && !selectedIngredients.find(si => si.itemId === itemId)) {
            setSelectedIngredients([...selectedIngredients, { itemId: item.id, name: item.name }]);
        }
    };

    const removeIngredient = (itemId) => {
        setSelectedIngredients(selectedIngredients.filter(i => i.itemId !== itemId));
    };



    const toggleMealType = (type) => {
        if (selectedMealTypes.includes(type)) {
            setSelectedMealTypes(selectedMealTypes.filter(t => t !== type));
        } else {
            setSelectedMealTypes([...selectedMealTypes, type]);
        }
    };

    const markAsCooked = (recipe) => {
        setRecipeToCook(recipe);
        setIsCookModalOpen(true);
    };

    const handleLogCook = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const recipeId = formData.get('recipeId');
        const recipe = recipes.find(r => r.id === recipeId);

        if (!recipe) return;

        const historyEntry = {
            id: crypto.randomUUID(),
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            comments: formData.get('comments'),
            date: new Date(formData.get('dateTime')).toISOString(),
        };
        setHistory([historyEntry, ...history]);

        // Reduce inventory
        let updatedInventory = [...inventory];
        recipe.ingredients?.forEach(ing => {
            const invIndex = updatedInventory.findIndex(i => i.itemId === ing.itemId);
            if (invIndex !== -1) {
                updatedInventory[invIndex] = {
                    ...updatedInventory[invIndex],
                    quantity: Math.max(0, updatedInventory[invIndex].quantity - 1)
                };
            }
        });
        const finalInventory = updatedInventory.filter(i => i.quantity > 0);
        setInventory(finalInventory);

        setIsCookModalOpen(false);
        setRecipeToCook(null);
        alert(`Logged "${recipe.title}"! Inventory updated.`);
    };

    const handleSavePlan = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const recipeId = formData.get('recipeId');
        const customTitle = formData.get('customTitle');

        const newPlan = {
            id: currentPlanItem ? currentPlanItem.id : crypto.randomUUID(),
            date: formData.get('date'),
            mealType: formData.get('mealType'),
            recipeId: recipeId || null,
            title: recipeId ? recipes.find(r => r.id === recipeId)?.title : customTitle,
            notes: formData.get('notes'),
        };

        if (currentPlanItem) {
            setMealPlans(mealPlans.map(p => p.id === currentPlanItem.id ? newPlan : p));
        } else {
            setMealPlans([...mealPlans, newPlan]);
        }
        setIsPlanModalOpen(false);
        setCurrentPlanItem(null);
    };

    const handleDeletePlan = (id) => {
        if (window.confirm("Remove this from plan?")) {
            setMealPlans(mealPlans.filter(p => p.id !== id));
            setIsPlanModalOpen(false);
            setCurrentPlanItem(null);
        }
    };

    // Group plans by date
    const sortedPlans = [...mealPlans].sort((a, b) => new Date(a.date) - new Date(b.date));
    const groupedPlans = sortedPlans.reduce((acc, plan) => {
        const dateKey = plan.date; // YYYY-MM-DD
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(plan);
        return acc;
    }, {});


    const handleCancel = () => {
        setIsModalOpen(false);
        setCurrentRecipe(null);
        if (location.state?.openAddModal) {
            navigate(-1);
        }
    };

    return (
        <div className="page meals-page">

            <SegmentedControl
                options={[
                    { value: 'plan', label: 'Plan' },
                    { value: 'recipes', label: 'Recipes' },
                    { value: 'history', label: 'History' }
                ]}
                value={activeTab}
                onChange={setActiveTab}
            />

            {activeTab === 'plan' && (
                <div className="plan-list">
                    <div className="list-header">
                        <h3>Meal Plan</h3>
                        <button className="btn-primary" onClick={() => setIsPlanModalOpen(true)}>
                            <Plus size={18} /> Add Plan
                        </button>
                    </div>

                    {Object.keys(groupedPlans).length === 0 ? (
                        <div className="empty-state">
                            <Calendar size={48} color="#cbd5e1" />
                            <p>No meals planned yet.</p>
                        </div>
                    ) : (
                        Object.entries(groupedPlans).map(([date, plans]) => (
                            <div key={date} className="plan-day-group">
                                <h4 className="plan-date-header">{formatDate(date)}</h4>
                                <div className="plan-items">
                                    {plans.map(plan => (
                                        <div
                                            key={plan.id}
                                            className="plan-item card"
                                            onClick={() => { setCurrentPlanItem(plan); setIsPlanModalOpen(true); }}
                                        >
                                            <div className="plan-item-main">
                                                <div className="plan-item-info">
                                                    <span className="meal-type-badge">{plan.mealType}</span>
                                                    <h3>{plan.title}</h3>
                                                    {plan.notes && <p className="plan-notes">{plan.notes}</p>}
                                                </div>
                                                <div className="plan-item-icon">
                                                    {plan.recipeId ? <Utensils size={18} color="#3b82f6" /> : <MapPin size={18} color="#f59e0b" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                    <button className="fab-add" onClick={() => setIsPlanModalOpen(true)}>
                        <Plus size={24} color="white" />
                    </button>
                </div>
            )}

            {activeTab === 'recipes' && (
                <div className="recipe-list">
                    <div className="list-header">
                        <h3>My Recipes</h3>
                        <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={18} /> Add Recipe</button>
                    </div>
                    {recipes.length === 0 ? (
                        <div className="empty-state"><Utensils size={48} color="#cbd5e1" /><p>No recipes yet.</p></div>
                    ) : (
                        recipes.map(recipe => (
                            <div key={recipe.id} className="recipe-compact-card card" onClick={() => { setCurrentRecipe(recipe); setIsModalOpen(true); }}>
                                <div className="recipe-header">
                                    <h3>{recipe.title}</h3>
                                    <div className="card-actions">
                                        <span className="meta-pill"><Clock size={12} /> {recipe.cookTime}m</span>
                                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); markAsCooked(recipe); }} title="Mark as Cooked">
                                            <CookingPot size={16} color="#10b981" />
                                        </button>
                                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setCurrentRecipe(recipe); setIsModalOpen(true); }}>
                                            <Edit2 size={16} color="#94a3b8" />
                                        </button>
                                        <button className="btn-icon" onClick={(e) => handleDeleteRecipe(recipe.id, e)}>
                                            <Trash2 size={16} color="#ef4444" />
                                        </button>
                                    </div>
                                </div>
                                <div className="recipe-details">
                                    {(recipe.calories || recipe.earlyPrep) && (
                                        <>
                                            <div className="main-meta">
                                                {recipe.calories && <span className="meta-pill"><Flame size={12} /> {recipe.calories}</span>}
                                                {recipe.earlyPrep && <span className="meta-pill prep"><Timer size={12} /></span>}
                                            </div>
                                            <div className="meta-divider"></div>
                                        </>
                                    )}
                                    <div className="meal-tags">
                                        {recipe.mealTypes?.map(type => (
                                            <span key={type} className="mini-tag">{type}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="ingredients-line">
                                    {recipe.ingredients?.map(ing => ing.name).join(', ')}
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
                                <p>{formatDateTime(entry.date)}</p>
                                {entry.comments && <p className="history-comments">"{entry.comments}"</p>}
                            </div>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </div>
                    ))}
                </div>
            )}

            <BottomSheet
                isOpen={isModalOpen}
                onClose={handleCancel}
                title={currentRecipe ? 'Edit Recipe' : 'Add New Recipe'}
            >
                <form onSubmit={handleAddRecipe}>
                    <div className="form-group">
                        <label>Recipe Title</label>
                        <input name="title" defaultValue={currentRecipe?.title} required placeholder="e.g. Pasta Carbonara" autoFocus />
                    </div>

                    <div className="form-group">
                        <label>Steps (one per line)</label>
                        <textarea name="steps" defaultValue={currentRecipe?.steps?.join('\n')} rows="3" placeholder="1. Boil water..."></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Cook Time (m)</label>
                            <input type="number" name="cookTime" defaultValue={currentRecipe?.cookTime || 30} required />
                        </div>
                        <div className="form-group">
                            <label>Calories (kcal)</label>
                            <input type="number" name="calories" defaultValue={currentRecipe?.calories} placeholder="e.g. 450" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={earlyPrep} onChange={(e) => setEarlyPrep(e.target.checked)} />
                            <span>Requires Early Preparation</span>
                        </label>
                    </div>

                    {earlyPrep && (
                        <div className="form-group animate-slide-down">
                            <label>Early Prep Steps</label>
                            <textarea
                                name="earlyPrepSteps"
                                defaultValue={currentRecipe?.earlyPrepSteps}
                                rows="2"
                                placeholder="e.g. Marinate chicken for 30 mins..."
                            ></textarea>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Suitability (Select Times)</label>
                        <div className="tag-cloud">
                            {MEAL_TYPES.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    className={`tag-btn ${selectedMealTypes.includes(type) ? 'active' : ''}`}
                                    onClick={() => toggleMealType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Ingredients</label>
                        <div className="ingredient-selector">
                            <select onChange={(e) => { addIngredient(e.target.value); e.target.value = ""; }}>
                                <option value="">+ Add Ingredient</option>
                                {masterItems.filter(mi => !selectedIngredients.find(si => si.itemId === mi.id)).map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="selected-ingredients">
                            {selectedIngredients.map(ing => (
                                <div key={ing.itemId} className="ing-edit-row">
                                    <span>{ing.name}</span>
                                    <button type="button" className="btn-icon" onClick={() => removeIngredient(ing.itemId)}><Trash2 size={16} color="#ef4444" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
                        {currentRecipe && (
                            <button type="button" className="btn-danger-outline" onClick={() => handleDeleteRecipe(currentRecipe.id)}>
                                <Trash2 size={16} /> Delete
                            </button>
                        )}
                        <button type="submit" className="btn-primary flex-1">{currentRecipe ? 'Update' : 'Create Recipe'}</button>
                    </div>
                </form>
            </BottomSheet>

            <BottomSheet
                isOpen={isCookModalOpen}
                onClose={() => { setIsCookModalOpen(false); setRecipeToCook(null); }}
                title="Log Cooking"
            >
                <form onSubmit={handleLogCook}>
                    <div className="form-group">
                        <label>What did you cook?</label>
                        <select name="recipeId" defaultValue={recipeToCook?.id} required>
                            <option value="">Select a recipe...</option>
                            {recipes.map(r => (
                                <option key={r.id} value={r.id}>{r.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Date & Time</label>
                        <input
                            type="datetime-local"
                            name="dateTime"
                            defaultValue={getLocalDateTimeForInput()}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Comments</label>
                        <textarea name="comments" rows="2" placeholder="Any notes about this cook?"></textarea>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={() => { setIsCookModalOpen(false); setRecipeToCook(null); }}>Cancel</button>
                        <button type="submit" className="btn-primary flex-1">Log Cooking</button>
                    </div>
                </form>
            </BottomSheet>

            <BottomSheet
                isOpen={isPlanModalOpen}
                onClose={() => { setIsPlanModalOpen(false); setCurrentPlanItem(null); }}
                title={currentPlanItem ? 'Edit Plan' : 'Add to Meal Plan'}
            >
                <form onSubmit={handleSavePlan}>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            defaultValue={currentPlanItem?.date || getLocalDateTimeForInput().split('T')[0]}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Meal Type</label>
                        <select name="mealType" defaultValue={currentPlanItem?.mealType || 'Dinner'} required>
                            {MEAL_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Recipe (Optional)</label>
                        <select
                            name="recipeId"
                            defaultValue={currentPlanItem?.recipeId || ''}
                            onChange={(e) => {
                                const customInput = document.getElementById('plan-custom-title');
                                if (e.target.value) {
                                    customInput.value = '';
                                    customInput.disabled = true;
                                } else {
                                    customInput.disabled = false;
                                }
                            }}
                        >
                            <option value="">-- Custom / Eating Out --</option>
                            {recipes.map(r => (
                                <option key={r.id} value={r.id}>{r.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Custom Title / Location</label>
                        <input
                            id="plan-custom-title"
                            name="customTitle"
                            defaultValue={currentPlanItem?.title && !currentPlanItem.recipeId ? currentPlanItem.title : ''}
                            placeholder="e.g. Dinner at Grandma's"
                            disabled={!!currentPlanItem?.recipeId}
                        />
                        <p className="form-help">Use this if you're not cooking a recipe (e.g., eating out, friends, etc.)</p>
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea name="notes" defaultValue={currentPlanItem?.notes} rows="2" placeholder="Any extra details..."></textarea>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={() => { setIsPlanModalOpen(false); setCurrentPlanItem(null); }}>Cancel</button>
                        {currentPlanItem && (
                            <button type="button" className="btn-danger-outline" onClick={() => handleDeletePlan(currentPlanItem.id)}>
                                <Trash2 size={16} /> Delete
                            </button>
                        )}
                        <button type="submit" className="btn-primary flex-1">{currentPlanItem ? 'Update' : 'Add to Plan'}</button>
                    </div>
                </form>
            </BottomSheet>
        </div>
    );
};

export default Meals;
