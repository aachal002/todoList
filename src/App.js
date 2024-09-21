import React, { useEffect, useState } from 'react';
import './TodoList.css'; // Import the CSS file for custom styles

const Todolist = () => {
  const API = "https://dummyjson.com/todos"; // Base URL
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [newTodo, setNewTodo] = useState(""); // New state for the input field
  const [editingId, setEditingId] = useState(null); // Track which todo is being edited
  const [editedText, setEditedText] = useState(""); // Text for the edited todo

  const LIMIT = 20; // Number of todos to fetch at a time

  const saveToLocalStorage = (todos) => {
    localStorage.setItem('todos', JSON.stringify(todos));
  };

  const loadFromLocalStorage = () => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      return JSON.parse(storedTodos);
    }
    return [];
  };

  const fetchApi = async (link, skipCount) => {
    try {
      const url = `${link}?limit=${LIMIT}&skip=${skipCount}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await res.json();
      const updatedTodos = [...todos, ...data.todos];
      setTodos(updatedTodos);
      setSkip(skipCount + LIMIT);
      setLoading(false);
      saveToLocalStorage(updatedTodos);
      if (data.todos.length < LIMIT) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedTodos = loadFromLocalStorage();
    if (storedTodos.length > 0) {
      setTodos(storedTodos);
      setLoading(false);
    } else {
      fetchApi(API, skip);
    }
  }, []);

  const handleLoadMore = () => {
    setLoading(true);
    fetchApi(API, skip);
  };

  const toggleComplete = (id) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveToLocalStorage(updatedTodos);
  };

  const handleAddTodo = () => {
    if (newTodo.trim() === "") return;

    const newTodoItem = {
      id: Date.now() + Math.random(),
      todo: newTodo,
      completed: false,
    };

    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);
    saveToLocalStorage(updatedTodos);
    setNewTodo("");
  };

  const handleDeleteTodo = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    saveToLocalStorage(updatedTodos);
  };

  const handleEditTodo = (id, currentText) => {
    setEditingId(id);
    setEditedText(currentText);
  };

  const handleSaveEdit = (id) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, todo: editedText } : todo
    );
    setTodos(updatedTodos);
    saveToLocalStorage(updatedTodos);
    setEditingId(null);
    setEditedText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedText("");
  };

  

  if (loading && todos.length === 0) return <div>Loading...</div>;

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="todolist-container">
      <h1 className="todolist-title">Todo List</h1>
      <div className="todolist-header">
        <h3>Total Number of Todos Loaded: {todos.length}</h3>
      </div>
      <div className="new-todo">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo"
          className="new-todo-input"
        />
        <button className="add-button" onClick={handleAddTodo}>Add</button>
      </div>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id)}
              className="todo-checkbox"
            />
            {editingId === todo.id ? (
              <div className="edit-mode">
                <input
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="edit-todo-input"
                />
                <button className="save-button" onClick={() => handleSaveEdit(todo.id)}>Save</button>
                <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
              </div>
            ) : (
              <div className="todo-view">
                <span
                  className="todo-text"
                  style={{
                    textDecoration: todo.completed ? "line-through" : "none",
                  }}
                >
                  {todo.todo}
                </span>
                <div className="todo-actions">
                  <button className="edit-button" onClick={() => handleEditTodo(todo.id, todo.todo)}>Edit</button>
                  <button className="delete-button" onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {hasMore && !loading && (
        <button className="load-more-button" onClick={handleLoadMore}>Load More</button>
      )}
      {loading && todos.length > 0 && <div>Loading more...</div>}
    </div>
  );
};

export default Todolist;
