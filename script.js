document.addEventListener('DOMContentLoaded', function() {
    // Initialize tasks from localStorage or create empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // DOM elements - Main UI
    const taskInput = document.getElementById('taskInput');
    const categorySelect = document.getElementById('categorySelect');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDateInput');
    const taskNotes = document.getElementById('taskNotes');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    const emptyMessage = document.getElementById('emptyMessage');
    const taskTemplate = document.getElementById('taskTemplate');
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;
    
    // DOM elements - Filter & Sort
    const filterCategory = document.getElementById('filterCategory');
    const filterPriority = document.getElementById('filterPriority');
    const filterStatus = document.getElementById('filterStatus');
    const sortBy = document.getElementById('sortBy');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    // DOM elements - Delete Modal
    const deleteModal = document.getElementById('deleteModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const taskToDeleteText = document.querySelector('.task-to-delete');
    
    // DOM elements - Edit Modal
    const editModal = document.getElementById('editModal');
    const editTaskInput = document.getElementById('editTaskInput');
    const editCategorySelect = document.getElementById('editCategorySelect');
    const editPrioritySelect = document.getElementById('editPrioritySelect');
    const editDueDateInput = document.getElementById('editDueDateInput');
    const editTaskNotes = document.getElementById('editTaskNotes');
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const saveEditBtn = document.getElementById('saveEdit');
    
    // Variables to store task IDs
    let taskIdToDelete = null;
    let taskIdToEdit = null;
    
    // Initialize theme from localStorage or default to light
    initTheme();
    
    // Event listeners - Main functionality
    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keydown', handleKeyDown);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Event listeners - Filter & Sort
    filterCategory.addEventListener('change', applyFiltersAndSort);
    filterPriority.addEventListener('change', applyFiltersAndSort);
    filterStatus.addEventListener('change', applyFiltersAndSort);
    sortBy.addEventListener('change', applyFiltersAndSort);
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Event listeners - Delete Modal
    closeModalBtn.addEventListener('click', closeDeleteModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', confirmDeleteTask);
    
    // Event listeners - Edit Modal
    closeEditModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEditedTask);
    
    // Close modals when clicking outside of them
    window.addEventListener('click', function(event) {
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
        if (event.target === editModal) {
            closeEditModal();
        }
    });
    
    // Load saved tasks on initial page load
    renderTasks();
    
    // Theme functions
    function initTheme() {
        // Check if there's a theme preference in localStorage
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark') {
            htmlEl.classList.remove('light-mode');
            htmlEl.classList.add('dark-mode');
        } else {
            htmlEl.classList.remove('dark-mode');
            htmlEl.classList.add('light-mode');
        }
    }
    
    function toggleTheme() {
        if (htmlEl.classList.contains('dark-mode')) {
            // Switch to light mode
            htmlEl.classList.remove('dark-mode');
            htmlEl.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            // Switch to dark mode
            htmlEl.classList.remove('light-mode');
            htmlEl.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // Send tasks to server for backup (optional PHP integration)
    function syncWithServer() {
        fetch('save_tasks.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tasks: tasks })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Tasks saved to server');
            }
        })
        .catch(error => {
            console.error('Error saving to server:', error);
        });
    }
    
    // Load tasks from server (optional PHP integration)
    function loadFromServer() {
        fetch('get_tasks.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.tasks) {
                tasks = data.tasks;
                saveToLocalStorage();
                renderTasks();
            }
        })
        .catch(error => {
            console.error('Error loading from server:', error);
        });
    }
    
    // Add new task with enhanced properties
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            const task = {
                id: Date.now(),
                text: taskText,
                category: categorySelect.value,
                priority: prioritySelect.value,
                dueDate: dueDateInput.value,
                notes: taskNotes.value.trim(),
                completed: false,
                dateAdded: new Date().toISOString()
            };
            
            tasks.push(task);
            saveToLocalStorage();
            renderTasks();
            syncWithServer(); // Optional: sync with server
            
            // Clear form fields
            taskInput.value = '';
            categorySelect.value = '';
            prioritySelect.value = '';
            dueDateInput.value = '';
            taskNotes.value = '';
            taskInput.focus();
        }
    }
    
    // Toggle task completion
    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveToLocalStorage();
        renderTasks();
        syncWithServer(); // Optional: sync with server
    }
    
    // Filter and sort tasks
    function applyFiltersAndSort() {
        renderTasks();
    }
    
    // Clear all filters and reset to defaults
    function clearFilters() {
        filterCategory.value = '';
        filterPriority.value = '';
        filterStatus.value = '';
        sortBy.value = 'dateAdded';
        renderTasks();
    }
    
    // Show delete confirmation modal
    function showDeleteModal(id) {
        const task = tasks.find(task => task.id === parseInt(id));
        if (task) {
            taskIdToDelete = parseInt(id);
            taskToDeleteText.textContent = `"${task.text}"`;
            deleteModal.classList.add('show');
        }
    }
    
    // Close the delete modal
    function closeDeleteModal() {
        deleteModal.classList.remove('show');
        taskIdToDelete = null;
    }
    
    // Confirm and execute task deletion
    function confirmDeleteTask() {
        if (taskIdToDelete !== null) {
            deleteTask(taskIdToDelete);
            closeDeleteModal();
        }
    }
    
    // Delete task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveToLocalStorage();
        renderTasks();
        syncWithServer(); // Optional: sync with server
    }

    // Show edit task modal
    function showEditModal(id) {
        const task = tasks.find(task => task.id === parseInt(id));
        if (task) {
            taskIdToEdit = parseInt(id);
            
            // Fill the edit form with task data
            editTaskInput.value = task.text;
            editCategorySelect.value = task.category || '';
            editPrioritySelect.value = task.priority || '';
            editDueDateInput.value = task.dueDate || '';
            editTaskNotes.value = task.notes || '';
            
            // Show the modal
            editModal.classList.add('show');
        }
    }
    
    // Close the edit modal
    function closeEditModal() {
        editModal.classList.remove('show');
        taskIdToEdit = null;
    }
    
    // Save edited task
    function saveEditedTask() {
        if (taskIdToEdit !== null) {
            const updatedText = editTaskInput.value.trim();
            
            if (updatedText !== '') {
                tasks = tasks.map(task => {
                    if (task.id === taskIdToEdit) {
                        return {
                            ...task,
                            text: updatedText,
                            category: editCategorySelect.value,
                            priority: editPrioritySelect.value,
                            dueDate: editDueDateInput.value,
                            notes: editTaskNotes.value.trim()
                        };
                    }
                    return task;
                });
                
                saveToLocalStorage();
                renderTasks();
                syncWithServer(); // Optional: sync with server
                closeEditModal();
            }
        }
    }
    
    // Toggle task details visibility
    function toggleTaskDetails(taskElement) {
        const details = taskElement.querySelector('.task-details');
        const expandButton = taskElement.querySelector('.expand-button');
        
        if (details.classList.contains('expanded')) {
            details.classList.remove('expanded');
            expandButton.classList.remove('expanded');
        } else {
            details.classList.add('expanded');
            expandButton.classList.add('expanded');
        }
    }
    
    // Handle Enter key press
    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    }
    
    // Save tasks to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Render all tasks with filters applied
    function renderTasks() {
        // Get filter values
        const categoryFilter = filterCategory.value;
        const priorityFilter = filterPriority.value;
        const statusFilter = filterStatus.value;
        const sortByValue = sortBy.value;
        
        // Apply filters
        let filteredTasks = tasks.filter(task => {
            // Category filter
            if (categoryFilter && task.category !== categoryFilter) {
                return false;
            }
            
            // Priority filter
            if (priorityFilter && task.priority !== priorityFilter) {
                return false;
            }
            
            // Status filter
            if (statusFilter === 'completed' && !task.completed) {
                return false;
            }
            if (statusFilter === 'pending' && task.completed) {
                return false;
            }
            
            return true;
        });
        
        // Apply sorting
        filteredTasks.sort((a, b) => {
            switch (sortByValue) {
                case 'dueDate':
                    // Handle empty dates (move to end)
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                
                case 'priority':
                    // Define priority order
                    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3, '': 4 };
                    return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
                
                case 'alphabetical':
                    return a.text.localeCompare(b.text);
                
                default: // dateAdded
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
            }
        });
        
        // Clear previous task elements
        taskList.querySelectorAll('.task-item').forEach(element => element.remove());
        
        // Show/hide empty message
        if (filteredTasks.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            
            // Create and append task elements
            filteredTasks.forEach(task => {
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        }
    }
    
    // Format date from ISO string to local date format
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }
    
    // Create a task element from template with all features
    function createTaskElement(task) {
        const taskClone = document.importNode(taskTemplate.content, true);
        const taskItem = taskClone.querySelector('.task-item');
        const checkbox = taskClone.querySelector('.checkbox');
        const label = taskClone.querySelector('.task-label');
        const categoryBadge = taskClone.querySelector('.category-badge');
        const priorityBadge = taskClone.querySelector('.priority-badge');
        const dateBadge = taskClone.querySelector('.date-badge');
        const taskNotes = taskClone.querySelector('.task-notes');
        const expandButton = taskClone.querySelector('.expand-button');
        const editButton = taskClone.querySelector('.edit-button');
        const deleteButton = taskClone.querySelector('.delete-button');
        const taskDetails = taskClone.querySelector('.task-details');
        
        // Set task ID as a data attribute
        taskItem.dataset.taskId = task.id;
        
        // Set unique ID for checkbox and label connection
        const checkboxId = `task-${task.id}`;
        checkbox.id = checkboxId;
        label.htmlFor = checkboxId;
        
        // Set task data
        label.textContent = task.text;
        checkbox.checked = task.completed;
        
        if (task.completed) {
            taskItem.classList.add('completed');
            label.classList.add('completed');
        }
        
        // Set category badge if available
        if (task.category) {
            categoryBadge.textContent = task.category;
            categoryBadge.classList.add(`category-${task.category.toLowerCase()}`);
        } else {
            categoryBadge.style.display = 'none';
        }
        
        // Set priority badge if available
        if (task.priority) {
            priorityBadge.textContent = task.priority;
            priorityBadge.classList.add(`priority-${task.priority.toLowerCase()}`);
        } else {
            priorityBadge.style.display = 'none';
        }
        
        // Set due date badge if available
        if (task.dueDate) {
            dateBadge.textContent = formatDate(task.dueDate);
            
            // Add overdue class if applicable
            const today = new Date();
            const dueDate = new Date(task.dueDate);
            if (!task.completed && dueDate < today) {
                dateBadge.classList.add('overdue');
            }
        } else {
            dateBadge.style.display = 'none';
        }
        
        // Set notes if available
        if (task.notes) {
            taskNotes.textContent = task.notes;
        } else {
            taskDetails.style.display = 'none';
            expandButton.style.display = 'none';
        }
        
        // Add event listeners
        checkbox.addEventListener('change', () => toggleTask(task.id));
        expandButton.addEventListener('click', () => toggleTaskDetails(taskItem));
        editButton.addEventListener('click', () => showEditModal(task.id));
        deleteButton.addEventListener('click', () => showDeleteModal(task.id));
        
        return taskClone;
    }
    
    // Optional: Load tasks from server on page load
    // Uncomment to use the PHP backend integration
    // loadFromServer();
});