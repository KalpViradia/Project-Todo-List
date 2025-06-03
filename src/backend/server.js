const odbc = require('odbc');
const express = require('express');
const app = express();
const cors = require('cors')
const PORT = 3000;

// Define the connection string directly as a string
const connectionString = 'Driver={SQL Server};Server=localhost;Database=TodoDB;Trusted_Connection=yes;';

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON data
app.use(express.json());

// Function to connect to the database
async function connectToDb() {
  try {
    // Use the connection string directly
    const connection = await odbc.connect(connectionString);
    console.log('Connected to the database');
    connection.close();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

// Test the connection (run once on startup)
connectToDb();

// 1. Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const connection = await odbc.connect(connectionString);
    const result = await connection.query('SELECT * FROM Tasks');
    connection.close();
    res.json(result);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).send('Error fetching tasks');
  }
});

// 2. Add a new task
app.post('/tasks', async (req, res) => {
  const { title, description, priority, dueDate } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).send('Task title is required');
  }

  try {
    const connection = await odbc.connect(connectionString);
    const newTask = {
      title,
      description: description || '',
      priority: priority || 'Low',
      dueDate,
      completed: false,
      status: 'Incomplete',  // Default status
    };

    const query = `
      INSERT INTO Tasks (title, description, priority, dueDate, completed, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      newTask.title,
      newTask.description,
      newTask.priority,
      newTask.dueDate,
      newTask.completed ? 1 : 0,
      newTask.status
    ];

    await connection.query(query, params);
    connection.close();

    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error adding task:', err.message);
    console.error(err.stack);
    res.status(500).send(`Error adding task: ${err.message}`);
  }
});

// Helper function to calculate status based on completion and due date
function calculateStatus({ completed, dueDate }) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // normalize to midnight
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0); // normalize to midnight

  if (completed) {
    return 'Completed';
  } else if (due < currentDate) {
    return 'Overdue';
  } else {
    return 'Incomplete';
  }
}

// 3. Update an existing task (SAFE)
app.put('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const { title, description, priority, dueDate } = req.body;

  try {
    const connection = await odbc.connect(connectionString);
    const taskResult = await connection.query('SELECT * FROM Tasks WHERE id = ?', [taskId]);

    if (!taskResult.length) {
      return res.status(404).send('Task not found');
    }

    const task = taskResult[0];

    const updatedTask = {
      id: taskId,
      title: title || task.title,
      description: description || task.description,
      priority: priority || task.priority,
      dueDate: dueDate || task.dueDate,
      completed: task.completed,
      status: calculateStatus({ completed: task.completed, dueDate: dueDate || task.dueDate }),
    };

    const query = `
      UPDATE Tasks SET
        title = ?,
        description = ?,
        priority = ?,
        dueDate = ?,
        status = ?
      WHERE id = ?
    `;

    const params = [
      updatedTask.title,
      updatedTask.description,
      updatedTask.priority,
      updatedTask.dueDate,
      updatedTask.status,
      taskId
    ];

    await connection.query(query, params);
    connection.close();

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err.message);
    console.error(err.stack);
    res.status(500).send('Error updating task');
  }
});

// 4. Delete a specific task (SAFE version)
app.delete('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return res.status(400).send('Invalid task ID');
  }

  try {
    const connection = await odbc.connect(connectionString);
    const result = await connection.query('DELETE FROM Tasks WHERE id = ?', [taskId]);

    if (result.count === 0) { // .count is used in some odbc drivers, you can check .rowsAffected also
      return res.status(404).send('Task not found');
    }

    connection.close();
    res.status(204).send(); // 204 = No Content (success, nothing to send back)
  } catch (err) {
    console.error('Error deleting task:', err.message);
    console.error(err.stack);
    res.status(500).send('Error deleting task');
  }
});

// 5. Toggle task completion (via Stored Procedure)
app.put('/tasks/:id/toggle', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return res.status(400).send('Invalid task ID');
  }

  try {
    const connection = await odbc.connect(connectionString);

    // Execute stored procedure and fetch updated task
    const result = await connection.query(`EXEC sp_ToggleTaskCompletion @TaskId = ?`, [taskId]);

    connection.close();

    if (!result.length) {
      return res.status(404).send('Task not found or could not be toggled');
    }

    const updatedTask = result[0];
    res.json(updatedTask);
  } catch (err) {
    console.error('Error toggling task completion via SP:', err.message);
    console.error(err.stack);
    res.status(500).send('Error toggling task completion');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
