document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const tasksCounter = document.getElementById('tasks-counter');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // App State
    let tasks = [];
    let currentFilter = 'all';
    let editingId = null;
    
    // Load tasks from localStorage
    const loadTasks = () => {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
    };
    
    // Save tasks to localStorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };
    
    // Update tasks counter
    const updateTasksCounter = () => {
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
    };
    
    // Render tasks based on current filter
    const renderTasks = () => {
        // Clear the task list
        taskList.innerHTML = '';
        
        // Filter tasks based on current filter
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Render each task
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            
            // Create task content
            if (editingId === task.id) {
                // Editing mode
                const editInput = document.createElement('input');
                editInput.type = 'text';
                editInput.value = task.text;
                editInput.classList.add('task-text');
                editInput.style.flex = '1';
                editInput.style.padding = '5px';
                editInput.style.border = '1px solid #ddd';
                editInput.style.borderRadius = '4px';
                
                const saveBtn = document.createElement('button');
                saveBtn.innerHTML = '<i class="fas fa-save"></i>';
                saveBtn.classList.add('edit-btn');
                saveBtn.addEventListener('click', () => saveEdit(task.id, editInput.value));
                
                const cancelBtn = document.createElement('button');
                cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
                cancelBtn.classList.add('delete-btn');
                cancelBtn.addEventListener('click', () => cancelEdit());
                
                taskItem.appendChild(editInput);
                
                const actionDiv = document.createElement('div');
                actionDiv.classList.add('task-actions');
                actionDiv.appendChild(saveBtn);
                actionDiv.appendChild(cancelBtn);
                
                taskItem.appendChild(actionDiv);
                
                // Focus the input
                setTimeout(() => editInput.focus(), 0);
                
                // Handle Enter key
                editInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        saveEdit(task.id, editInput.value);
                    }
                });
            } else {
                // Normal mode
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.classList.add('task-checkbox');
                checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
                
                const taskText = document.createElement('span');
                taskText.textContent = task.text;
                taskText.classList.add('task-text');
                
                const editBtn = document.createElement('button');
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.classList.add('edit-btn');
                editBtn.addEventListener('click', () => startEdit(task.id));
                
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.classList.add('delete-btn');
                deleteBtn.addEventListener('click', () => deleteTask(task.id));
                
                taskItem.appendChild(checkbox);
                taskItem.appendChild(taskText);
                
                const actionDiv = document.createElement('div');
                actionDiv.classList.add('task-actions');
                actionDiv.appendChild(editBtn);
                actionDiv.appendChild(deleteBtn);
                
                taskItem.appendChild(actionDiv);
            }
            
            taskList.appendChild(taskItem);
        });
        
        updateTasksCounter();
    };
    
    // Add a new task
    const addTask = (text) => {
        const newTask = {
            id: Date.now().toString(),
            text: text.trim(),
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
    };
    
    // Delete a task
    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    };
    
    // Toggle task status (completed/active)
    const toggleTaskStatus = (id) => {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    };
    
    // Start editing a task
    const startEdit = (id) => {
        editingId = id;
        renderTasks();
    };
    
    // Save edited task
    const saveEdit = (id, newText) => {
        if (newText.trim() === '') {
            deleteTask(id);
            return;
        }
        
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, text: newText.trim() };
            }
            return task;
        });
        
        editingId = null;
        saveTasks();
        renderTasks();
    };
    
    // Cancel editing
    const cancelEdit = () => {
        editingId = null;
        renderTasks();
    };
    
    // Clear completed tasks
    const clearCompleted = () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    };
    
    // Change current filter
    const changeFilter = (filter) => {
        currentFilter = filter;
        
        // Update active filter button
        filterBtns.forEach(btn => {
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        renderTasks();
    };
    
    // Event Listeners
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (taskInput.value.trim() !== '') {
            addTask(taskInput.value);
            taskInput.value = '';
        }
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            changeFilter(filter);
        });
    });
    
    // Initialize app
    loadTasks();
    renderTasks();
});