import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabase";
import { Link } from "react-router-dom"; // Import Link

enum Category {
  Happiness = "happiness",
  Health = "health",
  SelfActualization = "self_actualization",
  Connection = "social_connection",
}

type Task = {
  id: number;
  user_id: string;
  category: Category;
  complexity: number;
  description: string;
  due: string;
  completed: boolean;
};

// Helper function to map enum to display-friendly names
function getCategoryDisplayName(category: Category): string {
  switch (category) {
    case Category.Happiness:
      return "Happiness";
    case Category.Health:
      return "Health";
    case Category.SelfActualization:
      return "Self-Actualization";
    case Category.Connection:
      return "Connection";
    default:
      return category; // Default case for unknown categories
  }
}

function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'uncompleted'>('all'); // Filter state to control showing all tasks or only completed tasks

  // Fetch tasks from Supabase for the current user
  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);

        // Get the current user's ID from the session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          console.error("User session not found.");
          setError("User not authenticated.");
          return;
        }

        const userId = session.user.id;

        // Fetch tasks filtered by user_id
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", userId);

        console.log("Fetched tasks:", data);

        if (error) throw error;

        setTasks(data || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Error fetching tasks.");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  // Toggle completion
  async function toggleCompletion(id: number) {
    const updatedTask = tasks.find((task) => task.id === id);
    if (!updatedTask) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !updatedTask.completed })
        .eq("id", id);

      if (error) throw error;

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (err) {
      console.error("Error updating task:", err);
    }
  }

  // Filter tasks based on the filter state
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true; // Show all tasks
    if (filter === 'completed') return task.completed; // Show only completed tasks
    if (filter === 'uncompleted') return !task.completed; // Show only uncompleted tasks
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mx-auto max-w-lg rounded bg-white p-6 shadow-lg">
      <h1 className="mb-4 text-2xl font-bold">Your Todos</h1>
      
      {/* Filter Buttons */}
      <div className="mb-4 flex justify-end space-x-2">
        <button
          onClick={() => setFilter('all')}
          className="rounded bg-gray-200 px-4 py-2"
        >
          Show All
        </button>
        <button
          onClick={() => setFilter('completed')}
          className="rounded bg-gray-200 px-4 py-2"
        >
          Show Completed
        </button>
        <button
          onClick={() => setFilter('uncompleted')}
          className="rounded bg-gray-200 px-4 py-2"
        >
          Show Uncompleted
        </button>
      </div>

      {filteredTasks.map((task) => (
        <div
          key={task.id}
          className="mb-4 flex flex-col space-y-2 rounded border p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleCompletion(task.id)}
                className="h-5 w-5"
              />
              <span
                className={`${
                  task.completed ? "text-gray-500 line-through" : ""
                } text-lg font-semibold`}
              >
                {task.description}
              </span>
            </div>
            <span className="text-sm">{task.due}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`rounded px-2 py-1 text-xs font-semibold text-white ${
                task.category === Category.Happiness
                  ? "bg-blue-500"
                  : task.category === Category.SelfActualization
                  ? "bg-purple-500"
                  : task.category === Category.Connection
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
            >
              {getCategoryDisplayName(task.category)} {/* Display the formatted name */}
            </span>
            <span className="text-sm font-semibold">
              Complexity: {task.complexity}/5
            </span>
          </div>
        </div>
      ))}

      {/* Add New Task Button */}
      <div className="col-span-1 mt-4 flex justify-center">
        <Link to="/add-task">
          <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            Add New Task
          </button>
        </Link>
      </div>
    </div>
  );
}

export default TodoList;