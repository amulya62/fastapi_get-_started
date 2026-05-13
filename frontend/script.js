// Use relative path for API as it's served by the same FastAPI instance
const API_URL = ''; 

const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const itemsLeft = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';
let todos = [];

// Initial Load
document.addEventListener('DOMContentLoaded', fetchTodos);

// Event Listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

async function fetchTodos() {
    try {
        const response = await fetch(`${API_URL}/todos`);
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}

async function addTodo() {
    const title = todoInput.value.trim();
    if (!title) return;

    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, completed: false })
        });
        
        if (response.ok) {
            todoInput.value = '';
            const newTodo = await response.json();
            todos.push(newTodo);
            renderTodos();
        }
    } catch (error) {
        console.error('Error adding todo:', error);
    }
}

async function toggleTodo(id, currentStatus) {
    const newStatus = !currentStatus;
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: newStatus })
        });
        
        if (response.ok) {
            const updatedTodo = await response.json();
            todos = todos.map(t => t.id === id ? updatedTodo : t);
            
            // Trigger confetti if completed
            if (newStatus) {
                triggerConfetti();
            }
            
            renderTodos();
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
    }
}

async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
}

async function clearCompleted() {
    try {
        const response = await fetch(`${API_URL}/todos-clear-completed`, {
            method: 'DELETE'
        });
        if (response.ok) {
            todos = todos.filter(t => !t.completed);
            renderTodos();
        }
    } catch (error) {
        console.error('Error clearing completed:', error);
    }
}

function renderTodos() {
    todoList.innerHTML = '';
    
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    if (filteredTodos.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id}, ${todo.completed})">
                    ${todo.completed ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                </div>
                <span class="todo-text">${todo.title}</span>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})" aria-label="Delete task">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            `;
            todoList.appendChild(li);
        });
    }

    // Update stats
    const activeCount = todos.filter(t => !t.completed).length;
    itemsLeft.innerText = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#10b981']
    });
}
