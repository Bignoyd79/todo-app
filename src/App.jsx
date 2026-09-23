import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, update, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD1742U1MkAGygCzZ8LoYKrWCPoPTAeUNw",
  authDomain: "todo-app-4530b.firebaseapp.com",
  databaseURL: "https://todo-app-4530b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "todo-app-4530b",
  storageBucket: "todo-app-4530b.firebasestorage.app",
  messagingSenderId: "649275124273",
  appId: "1:649275124273:web:bc0385550cc123f239c310",
  measurementId: "G-FEZNLV1N4J"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const todosRef = ref(database, 'todos');
    const unsubscribe = onValue(todosRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const todosArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setTodos(todosArray);
      } else {
        setTodos([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addTodo = () => {
    if (input.trim() === '') return;
    const todosRef = ref(database, 'todos');
    push(todosRef, {
      text: input,
      completed: false,
      createdAt: new Date().toISOString()
    });
    setInput('');
  };

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      const todoRef = ref(database, `todos/${id}`);
      update(todoRef, { completed: !todo.completed });
    }
  };

  const deleteTodo = (id) => {
    const todoRef = ref(database, `todos/${id}`);
    remove(todoRef);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const completedCount = todos.filter(t => t.completed).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center">
        <p className="text-gray-600">⏳ Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Moje Zadania</h1>
          <p className="text-gray-500 mb-6">
            {completedCount} z {todos.length} gotowych ☁️
          </p>

          {/* Input */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Dodaj nowe zadanie..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTodo}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition font-bold"
            >
              ➕
            </button>
          </div>

          {/* Lista zadań */}
          <div className="space-y-2">
            {todos.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Brak zadań 🎉</p>
            ) : (
              todos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="text-blue-500 hover:text-blue-600 flex-shrink-0 transition text-xl"
                  >
                    {todo.completed ? '✅' : '⭕'}
                  </button>
                  <span
                    className={`flex-1 ${
                      todo.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-800'
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-600 flex-shrink-0 transition text-xl"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Progress bar */}
          {todos.length > 0 && (
            <div className="mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-300"
                style={{ width: `${(completedCount / todos.length) * 100}%` }}
              />
            </div>
          )}

          <p className="text-xs text-gray-400 mt-6 text-center">
            Wszystkie dane zapisane w chmurze ☁️
          </p>
        </div>
      </div>
    </div>
  );
}
