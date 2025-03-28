document.addEventListener('DOMContentLoaded', () => {
    // Получение элементов DOM
    const taskForm = document.getElementById('task-form'); // Форма добавления задачи
    const taskInput = document.getElementById('task-input'); // Поле ввода новой задачи
    const taskList = document.getElementById('task-list'); // Список задач
    const tasksCounter = document.getElementById('tasks-counter'); // Счетчик оставшихся задач
    const clearCompletedBtn = document.getElementById('clear-completed'); // Кнопка очистки выполненных задач
    const filterBtns = document.querySelectorAll('.filter-btn'); // Кнопки фильтрации
    
    // Состояние приложения
    let tasks = []; // Массив задач
    let currentFilter = 'all'; // Текущий фильтр (все, активные, выполненные)
    let editingId = null; // ID задачи, которая редактируется в данный момент
    
    // Загрузка задач из локального хранилища
    const loadTasks = () => {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks); // Преобразование JSON строки в массив объектов
        }
    };
    
    // Сохранение задач в локальное хранилище
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Преобразование массива объектов в JSON строку
    };
    
    // Обновление счетчика оставшихся задач
    const updateTasksCounter = () => {
        const activeTasks = tasks.filter(task => !task.completed).length; // Подсчет невыполненных задач
        tasksCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`; // Обновление текста счетчика
    };
    
    // Отображение задач на основе текущего фильтра
    const renderTasks = () => {
        // Очистка списка задач
        taskList.innerHTML = '';
        
        // Фильтрация задач в зависимости от выбранного фильтра
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed); // Только активные задачи
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed); // Только выполненные задачи
        }
        
        // Отображение каждой задачи
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li'); // Создание элемента списка
            taskItem.classList.add('task-item'); // Добавление класса для стилизации
            if (task.completed) {
                taskItem.classList.add('completed'); // Добавление класса для выполненных задач
            }
            
            // Создание содержимого задачи
            if (editingId === task.id) {
                // Режим редактирования задачи
                const editInput = document.createElement('input'); // Создание поля ввода для редактирования
                editInput.type = 'text';
                editInput.value = task.text; // Установка текущего текста задачи
                editInput.classList.add('task-text');
                editInput.style.flex = '1';
                editInput.style.padding = '5px';
                editInput.style.border = '1px solid #ddd';
                editInput.style.borderRadius = '4px';
                
                const saveBtn = document.createElement('button'); // Кнопка сохранения изменений
                saveBtn.innerHTML = '<i class="fas fa-save"></i>'; // Иконка сохранения
                saveBtn.classList.add('edit-btn');
                saveBtn.addEventListener('click', () => saveEdit(task.id, editInput.value)); // Обработчик сохранения
                
                const cancelBtn = document.createElement('button'); // Кнопка отмены редактирования
                cancelBtn.innerHTML = '<i class="fas fa-times"></i>'; // Иконка отмены
                cancelBtn.classList.add('delete-btn');
                cancelBtn.addEventListener('click', () => cancelEdit()); // Обработчик отмены
                
                taskItem.appendChild(editInput); // Добавление поля ввода в элемент задачи
                
                const actionDiv = document.createElement('div'); // Контейнер для кнопок действий
                actionDiv.classList.add('task-actions');
                actionDiv.appendChild(saveBtn); // Добавление кнопки сохранения
                actionDiv.appendChild(cancelBtn); // Добавление кнопки отмены
                
                taskItem.appendChild(actionDiv); // Добавление контейнера с кнопками в элемент задачи
                
                // Установка фокуса на поле ввода
                setTimeout(() => editInput.focus(), 0);
                
                // Обработка нажатия клавиши Enter для сохранения
                editInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        saveEdit(task.id, editInput.value);
                    }
                });
            } else {
                // Обычный режим отображения задачи
                const checkbox = document.createElement('input'); // Создание чекбокса
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed; // Установка состояния в зависимости от статуса задачи
                checkbox.classList.add('task-checkbox');
                checkbox.addEventListener('change', () => toggleTaskStatus(task.id)); // Обработчик изменения статуса
                
                const taskText = document.createElement('span'); // Создание элемента для текста задачи
                taskText.textContent = task.text; // Установка текста задачи
                taskText.classList.add('task-text');
                
                const editBtn = document.createElement('button'); // Кнопка редактирования
                editBtn.innerHTML = '<i class="fas fa-edit"></i>'; // Иконка редактирования
                editBtn.classList.add('edit-btn');
                editBtn.addEventListener('click', () => startEdit(task.id)); // Обработчик начала редактирования
                
                const deleteBtn = document.createElement('button'); // Кнопка удаления
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'; // Иконка удаления
                deleteBtn.classList.add('delete-btn');
                deleteBtn.addEventListener('click', () => deleteTask(task.id)); // Обработчик удаления
                
                taskItem.appendChild(checkbox); // Добавление чекбокса в элемент задачи
                taskItem.appendChild(taskText); // Добавление текста задачи
                
                const actionDiv = document.createElement('div'); // Контейнер для кнопок действий
                actionDiv.classList.add('task-actions');
                actionDiv.appendChild(editBtn); // Добавление кнопки редактирования
                actionDiv.appendChild(deleteBtn); // Добавление кнопки удаления
                
                taskItem.appendChild(actionDiv); // Добавление контейнера с кнопками в элемент задачи
            }
            
            taskList.appendChild(taskItem); // Добавление элемента задачи в список
        });
        
        updateTasksCounter(); // Обновление счетчика задач после отображения
    };
    
    // Добавление новой задачи
    const addTask = (text) => {
        const newTask = {
            id: Date.now().toString(), // Уникальный идентификатор на основе текущего времени
            text: text.trim(), // Текст задачи без лишних пробелов
            completed: false // Новая задача всегда не выполнена
        };
        
        tasks.push(newTask); // Добавление задачи в массив
        saveTasks(); // Сохранение в локальное хранилище
        renderTasks(); // Обновление отображения
    };
    
    // Удаление задачи
    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id); // Фильтрация массива для удаления задачи
        saveTasks(); // Сохранение в локальное хранилище
        renderTasks(); // Обновление отображения
    };
    
    // Переключение статуса задачи (выполнена/активна)
    const toggleTaskStatus = (id) => {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed }; // Инвертирование статуса задачи
            }
            return task;
        });
        
        saveTasks(); // Сохранение в локальное хранилище
        renderTasks(); // Обновление отображения
    };
    
    // Начало редактирования задачи
    const startEdit = (id) => {
        editingId = id; // Установка ID редактируемой задачи
        renderTasks(); // Перерисовка для отображения режима редактирования
    };
    
    // Сохранение отредактированной задачи
    const saveEdit = (id, newText) => {
        if (newText.trim() === '') {
            deleteTask(id); // Если текст пустой, удаляем задачу
            return;
        }
        
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, text: newText.trim() }; // Обновление текста задачи
            }
            return task;
        });
        
        editingId = null; // Сброс режима редактирования
        saveTasks(); // Сохранение в локальное хранилище
        renderTasks(); // Обновление отображения
    };
    
    // Отмена редактирования
    const cancelEdit = () => {
        editingId = null; // Сброс режима редактирования
        renderTasks(); // Обновление отображения
    };
    
    // Очистка выполненных задач
    const clearCompleted = () => {
        tasks = tasks.filter(task => !task.completed); // Оставляем только невыполненные задачи
        saveTasks(); // Сохранение в локальное хранилище
        renderTasks(); // Обновление отображения
    };
    
    // Изменение текущего фильтра
    const changeFilter = (filter) => {
        currentFilter = filter; // Установка нового фильтра
        
        // Обновление активной кнопки фильтра
        filterBtns.forEach(btn => {
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active'); // Добавление класса активной кнопке
            } else {
                btn.classList.remove('active'); // Удаление класса у неактивных кнопок
            }
        });
        
        renderTasks(); // Обновление отображения с новым фильтром
    };
    
    // Обработчики событий
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Предотвращение отправки формы
        if (taskInput.value.trim() !== '') {
            addTask(taskInput.value); // Добавление новой задачи
            taskInput.value = ''; // Очистка поля ввода
        }
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted); // Обработчик очистки выполненных задач
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter'); // Получение значения фильтра из атрибута
            changeFilter(filter); // Применение фильтра
        });
    });
    
    // Инициализация приложения
    loadTasks(); // Загрузка задач из локального хранилища
    renderTasks(); // Первоначальное отображение задач
});