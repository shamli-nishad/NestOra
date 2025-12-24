import React, { useEffect } from 'react';
import { Plus, CheckCircle, Circle, Trash2, Clock, AlertCircle, Edit2 } from 'lucide-react';
import { TASK_FREQUENCIES, TASK_PRIORITIES, TASK_SUBCATEGORIES } from '../../constants';
import { formatDate } from '../../utils/dateUtils';
import { isTaskDue, getNextDueDate, isTaskOverdue } from '../../utils/taskUtils';
import BottomSheet from '../../components/UI/BottomSheet';
import SegmentedControl from '../../components/UI/SegmentedControl';
import FilterBar from '../../components/UI/FilterBar';
import { useFilterSort } from '../../hooks/useFilterSort';
import './Tasks.css';

// Helper Component for rendering a single task card
const TaskItem = ({ task, onToggleTask, handleEditClick, onDeleteTask }) => (
    <div className={`task-card card ${task.completed ? 'completed' : ''} ${task.isProjection ? 'projection' : ''} ${isTaskOverdue(task) ? 'overdue' : ''}`}>
        <button
            className="check-btn"
            onClick={() => onToggleTask(task.id)}
            disabled={task.isProjection}
            style={task.isProjection ? { cursor: 'default', opacity: 0.5 } : {}}
        >
            {task.completed ? <CheckCircle size={24} color="#10b981" /> : <Circle size={24} color={task.isProjection ? "#e2e8f0" : "#cbd5e1"} />}
        </button>
        <div className="task-info">
            <div className="title-row">
                <h3>{task.title}</h3>
                {task.estimatedTime && (
                    <span className="time-badge">
                        <Clock size={12} /> {task.estimatedTime}m
                    </span>
                )}
            </div>
            <div className="meta">
                <span className="category-tag">{task.category}</span>
                {task.subCategory && <span className="subcategory-tag">{task.subCategory}</span>}
                <span className="frequency-tag">{task.frequency}</span>
                <span className={`priority-tag ${task.priority}`}>
                    {task.priority}
                </span>
                {task.dueDate && (
                    <span className="due-date">
                        {formatDate(task.dueDate)}
                    </span>
                )}
            </div>
            {task.frequency === 'Weekly' && task.frequencyDays && (
                <div className="freq-details">
                    {task.frequencyDays.join(', ')}
                </div>
            )}
        </div>
        <div className="card-actions">
            {!task.completed && !task.isProjection && (
                <button className="btn-icon edit-btn" onClick={() => handleEditClick(task)}>
                    <Edit2 size={18} color="#94a3b8" />
                </button>
            )}
            {!task.isProjection && (
                <button className="delete-btn" onClick={() => onDeleteTask(task.id)}>
                    <Trash2 size={18} color="#94a3b8" />
                </button>
            )}
        </div>
    </div>
);

const TasksList = ({
    tasks,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    onAddTask,
    onToggleTask,
    onDeleteTask,
    onUpdateTask,
    onCancel
}) => {
    const [editingTask, seteditingTask] = React.useState(null);
    // 1. First derive the list based on the active tab (Pending/Completed)
    const tabFilteredTasks = React.useMemo(() => {
        return tasks.filter(c => activeTab === 'pending' ? !c.completed : c.completed);
    }, [tasks, activeTab]);

    // 2. Define Filter and Sort Options
    const categories = Object.keys(TASK_SUBCATEGORIES);

    // Custom sort function for Priority (High > Medium > Low)
    const sortFunctions = {
        priority: (a, b, direction) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            const valA = priorityOrder[a.priority] || 0;
            const valB = priorityOrder[b.priority] || 0;
            return direction === 'asc' ? valA - valB : valB - valA;
        }
    };

    // 3. Use Custom Hook
    const {
        processedData: filteredTasks,
        filters,
        setFilter,
        sortConfig,
        setSortConfig
    } = useFilterSort(tabFilteredTasks, {
        initialSort: activeTab === 'completed'
            ? { key: 'completedAt', direction: 'desc' }
            : { key: 'dueDate', direction: 'asc' },
        sortFunctions
    });

    const [selectedFrequency, setSelectedFrequency] = React.useState(TASK_FREQUENCIES[0]);
    const [selectedCategory, setSelectedCategory] = React.useState(categories[0]);

    useEffect(() => {
        if (editingTask) {
            setSelectedCategory(editingTask.category);
            setSelectedFrequency(editingTask.frequency);
        } else {
            // Reset to defaults if not editing (optional, or rely on form reset)
            // But we keep user's last selection or default? Let's reset for fresh add
            // setSelectedCategory(categories[0]); 
            // setSelectedFrequency(TASK_FREQUENCIES[0]);
        }
    }, [editingTask]);

    // Update sort configuration when switching tabs
    useEffect(() => {
        if (activeTab === 'completed') {
            setSortConfig({ key: 'completedAt', direction: 'desc' });
        } else {
            setSortConfig({ key: 'dueDate', direction: 'asc' });
        }
    }, [activeTab, setSortConfig]);

    const subCategories = TASK_SUBCATEGORIES[selectedCategory] || [];

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Handle multi-select frequencyDays
        const frequencyDays = [];
        const checkboxes = e.target.querySelectorAll('input[name="frequencyDays"]:checked');
        checkboxes.forEach((checkbox) => {
            frequencyDays.push(checkbox.value);
        });

        const taskData = {
            title: formData.get('title'),
            category: formData.get('category'),
            subCategory: formData.get('subCategory'),
            frequency: formData.get('frequency'),
            frequencyDays: frequencyDays,
            frequencyDate: formData.get('frequencyDate'),
            estimatedTime: formData.get('estimatedTime'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate'),
            // Preserve existing fields if editing, else defaults
            id: editingTask ? editingTask.id : undefined,
            completed: editingTask ? editingTask.completed : false,
            createdAt: editingTask ? editingTask.createdAt : undefined,
            completedAt: editingTask ? editingTask.completedAt : undefined
        };

        if (editingTask) {
            onUpdateTask(taskData);
            seteditingTask(null);
        } else {
            // onAddTask expects event, we need to adapt it or change onAddTask
            // Wait, TasksContainer handleaddTask reads from e.target.
            // We should probably lift the form extraction logic to Container or adapt here.
            // Easier: just pass the event to onAddTask as before if not editing.
            // BUT, if we want to reuse the form logic...
            // Let's change TasksContainer to accept data object? 
            // Refactoring container is cleaner but let's stick to minimal changes:
            // We can just call onAddTask(e) if not editing.
            onAddTask(e);
        }
    };

    // We need to intercept the submit to handle update manually OR let onAddTask handle it.
    // Since onAddTask is tied to 'e.target', let's use a wrapper.
    const handleSubmitWrapper = (e) => {
        if (editingTask) {
            e.preventDefault();
            // Extract data manually for update
            const formData = new FormData(e.target);
            const frequencyDays = [];
            e.target.querySelectorAll('input[name="frequencyDays"]:checked').forEach(cb => frequencyDays.push(cb.value));

            const updated = {
                ...editingTask,
                title: formData.get('title'),
                category: formData.get('category'),
                subCategory: formData.get('subCategory'),
                frequency: formData.get('frequency'),
                frequencyDays: frequencyDays,
                frequencyDate: formData.get('frequencyDate'),
                priority: formData.get('priority'),
                dueDate: formData.get('dueDate'),
                estimatedTime: formData.get('estimatedTime') // if added field
            };
            onUpdateTask(updated);
            seteditingTask(null);
        } else {
            onAddTask(e);
        }
    };

    const handleEditClick = (task) => {
        seteditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        seteditingTask(null);
        onCancel();
    };

    return (
        <div className="page tasks-page">
            <SegmentedControl
                options={[
                    { value: 'pending', label: `Pending (${tasks.filter(c => !c.completed).length})` },
                    { value: 'completed', label: `Completed (${tasks.filter(c => c.completed).length})` }
                ]}
                value={activeTab}
                onChange={setActiveTab}
            />

            <FilterBar
                filterOptions={[
                    { key: 'category', label: 'Category', options: categories },
                    { key: 'priority', label: 'Priority', options: TASK_PRIORITIES.map(p => p.value) }
                ]}
                sortOptions={[
                    { value: 'dueDate', label: 'Date' },
                    { value: 'priority', label: 'Priority' },
                    { value: 'title', label: 'Name' }
                ]}
                currentFilters={filters}
                onFilterChange={setFilter}
                currentSort={sortConfig}
                onSortChange={setSortConfig}
            />

            <button className="btn-primary full-width add-btn-main" onClick={() => { seteditingTask(null); setIsModalOpen(true); }}>
                <Plus size={20} /> Add New Task
            </button>

            <div className="task-list">
                {filteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle size={48} color="#cbd5e1" />
                        <p>No tasks match your filters.</p>
                    </div>
                ) : (
                    activeTab === 'pending' ? (
                        <>
                            {/* Section: Tasks for Today */}
                            {filteredTasks.filter(c => isTaskDue(c)).length > 0 && (
                                <div className="list-section">
                                    <h3 className="section-header">Tasks for Today</h3>
                                    {filteredTasks.filter(c => isTaskDue(c)).map(task => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            onToggleTask={onToggleTask}
                                            handleEditClick={handleEditClick}
                                            onDeleteTask={onDeleteTask}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Section: Upcoming */}
                            {(() => {
                                // 1. Determine Upcoming Tasks
                                // A. Pending tasks NOT due today (from the already filtered list)
                                const pendingFutureTasks = filteredTasks.filter(c => !c.completed && !isTaskDue(c));

                                // B. Completed Recurring tasks (Projected for next occurrence)
                                // MUST source from 'tasks' (all tasks) because 'filteredTasks' only has pending ones due to activeTab context.
                                // B. Completed Recurring tasks (Projected for next occurrence)
                                // MUST source from 'tasks' (all tasks) because 'filteredTasks' only has pending ones due to activeTab context.
                                const completedRecurringTasks = tasks.filter(c => {
                                    if (!c.completed || c.frequency === 'One-time') return false;

                                    // Manually apply current active filters
                                    // filters.category is a string (e.g. 'All' or 'Health') or undefined
                                    const catFilter = filters.category;
                                    const priFilter = filters.priority;

                                    const matchesCategory = !catFilter || catFilter === 'All' || catFilter === c.category;
                                    const matchesPriority = !priFilter || priFilter === 'All' || priFilter === c.priority;

                                    return matchesCategory && matchesPriority;
                                });

                                const projectedFutureTasks = completedRecurringTasks.map(c => ({
                                    ...c,
                                    id: `${c.id}-future`, // Unique ID
                                    completed: false, // Visual state
                                    dueDate: getNextDueDate(c),
                                    isProjection: true
                                })).filter(c => c.dueDate);

                                const allUpcomingTasks = [...pendingFutureTasks, ...projectedFutureTasks];

                                // Sort by Date
                                allUpcomingTasks.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

                                if (allUpcomingTasks.length === 0) return null;

                                return (
                                    <div className="list-section">
                                        <h3 className="section-header">Upcoming</h3>
                                        {allUpcomingTasks.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                onToggleTask={task.isProjection ? () => { } : onToggleTask}
                                                handleEditClick={task.isProjection ? () => { } : handleEditClick}
                                                onDeleteTask={task.isProjection ? () => { } : onDeleteTask}
                                            />
                                        ))}
                                    </div>
                                );
                            })()}
                        </>
                    ) : (
                        // Completed Tab - Flat List
                        filteredTasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggleTask={onToggleTask}
                                handleEditClick={handleEditClick}
                                onDeleteTask={onDeleteTask}
                            />
                        ))
                    )
                )}
            </div>

            <BottomSheet
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingTask ? "Edit Task" : "Add New Task"}
            >
                <form onSubmit={handleSubmitWrapper}>
                    <div className="form-group">
                        <label>Task Title</label>
                        <input name="title" required placeholder="e.g. Wash Dishes" autoFocus defaultValue={editingTask?.title} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Sub-Category</label>
                            <select name="subCategory" defaultValue={editingTask?.subCategory}>
                                {/* Only show subcategories if available */}
                                {subCategories.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                                {subCategories.length === 0 && <option value="">None</option>}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Priority</label>
                        <select name="priority" defaultValue={editingTask?.priority || 'medium'}>
                            {TASK_PRIORITIES.map(priority => (
                                <option key={priority.value} value={priority.value}>{priority.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Frequency</label>
                        <select
                            name="frequency"
                            value={selectedFrequency}
                            onChange={(e) => setSelectedFrequency(e.target.value)}
                        >
                            {TASK_FREQUENCIES.map(freq => (
                                <option key={freq} value={freq}>{freq}</option>
                            ))}
                        </select>
                    </div>

                    {selectedFrequency === 'Weekly' && (
                        <div className="form-group">
                            <label>Repeat On</label>
                            <div className="week-days-selector">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <label key={day} className="day-checkbox">
                                        <input
                                            type="checkbox"
                                            name="frequencyDays"
                                            value={day}
                                            defaultChecked={editingTask?.frequencyDays?.includes(day)}
                                        />
                                        <span>{day}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedFrequency === 'Monthly' && (
                        <div className="form-group">
                            <label>Day of Month</label>
                            <select name="frequencyDate" defaultValue={editingTask?.frequencyDate || "1"}>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedFrequency === 'One-time' && (
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" name="dueDate" required defaultValue={editingTask?.dueDate} />
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary full-width" onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" className="btn-primary full-width">{editingTask ? "Update Task" : "Add Task"}</button>
                    </div>
                </form>
            </BottomSheet>
        </div>
    );
};

export default TasksList;


