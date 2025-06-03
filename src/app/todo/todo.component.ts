import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent {
  tasks: any[] = [];
  // Inject HttpClient using the new standalone approach
  private http = inject(HttpClient);

  // API URL
  private apiUrl = 'http://localhost:3000/tasks';

  // Form Fields
  newTaskTitle = '';
  newTaskDescription = '';
  newTaskPriority = 'Low';
  newTaskDueDate = '';

  // Edit Mode State
  isEditMode = false;
  taskToEditId: number | null = null;

  constructor() {
    this.loadTasks(); // Load tasks when component initializes
  }

  // Load all tasks from the backend
  loadTasks() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (tasks) => {
        console.log('Tasks loaded:', tasks);
  
        // Map the response data to match the component's expected field names
        this.tasks = tasks.map(task => ({
          id: task.Id,
          title: task.Title,
          description: task.Description,
          priority: task.Priority,
          dueDate: task.DueDate,
          completed: task.Completed === "1", // Convert "1" and "0" to boolean
          status: task.Status
        }));
  
        console.log('Mapped tasks:', this.tasks); // Check if the data is correctly mapped
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
      }
    });
  }
  

  // Add or update task based on mode
  addTask() {
    if (!this.newTaskTitle.trim()) {
      alert('Task title is required');
      return;
    }

    if (this.isEditMode && this.taskToEditId !== null) {
      this.updateTask(this.taskToEditId);
    } else {
      this.createTask();
    }

    this.resetForm();
  }

  // Create a new task
  createTask() {
    const newTask = {
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      priority: this.newTaskPriority,
      dueDate: this.newTaskDueDate
    };

    this.http.post(this.apiUrl, newTask).subscribe({
      next: (task: any) => {
        this.tasks.push(task); // Update tasks array
      },
      error: (err) => console.error('Error creating task:', err)
    });
  }

  // Update an existing task
  updateTask(taskId: number) {
    const updatedTask = {
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      priority: this.newTaskPriority,
      dueDate: this.newTaskDueDate
    };

    this.http.put(`${this.apiUrl}/${taskId}`, updatedTask).subscribe({
      next: (task: any) => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) this.tasks[index] = task; // Update the task in the list
      },
      error: (err) => console.error('Error updating task:', err)
    });

    this.isEditMode = false;
    this.taskToEditId = null;
  }

  // Delete a task
  deleteTask(task: any) {
    this.http.delete(`${this.apiUrl}/${task.id}`).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id); // Remove task from array
      },
      error: (err) => console.error('Error deleting task:', err)
    });
  }

  // Edit task
  editTask(task: any) {
    this.newTaskTitle = task.title;
    this.newTaskDescription = task.description;
    this.newTaskPriority = task.priority;
    this.newTaskDueDate = task.dueDate;
    this.isEditMode = true;
    this.taskToEditId = task.id;
  }

  // Toggle completed (if your backend supports it)
  toggleCompleted(task: any) {
    const updatedStatus = task.dueDate && new Date(task.dueDate) < new Date() 
      ? 'Overdue' // If the due date has passed, set the status as Overdue
      : 'Incomplete'; // Otherwise, mark as Incomplete
  
    const updatedTask = {
      ...task,
      completed: task.completed === '1' ? '0' : '1',  // Toggle between completed and incomplete
      status: updatedStatus
    };
  
    this.http.put(`${this.apiUrl}/${task.id}/toggle`, updatedTask).subscribe({
      next: (updatedTask: any) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;  // Update the task in the array
        }
        this.loadTasks(); // Reload the tasks after updating
      },
      error: (err) => console.error('Error toggling task:', err)
    });
  }
    
  
  // Get status based on the completion state and due date
  getStatus(dueDate: string, isCompleted: boolean): string {
    const today = new Date();
    const due = new Date(dueDate);
    if (isCompleted) {
      return "Completed";
    } else if (today > due) {
      return "Overdue";
    } else {
      return "Incomplete";
    }
  }      

  // Reset form
  resetForm() {
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskPriority = 'Low';
    this.newTaskDueDate = '';
    this.isEditMode = false;
    this.taskToEditId = null;
  }
}
