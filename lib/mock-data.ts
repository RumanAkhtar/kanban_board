export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority?: string
  listId: string
}

export interface List {
  id: string
  title: string
  order: number
}

export const mockData = {
  lists: [
    {
      id: "list-1",
      title: "To Do",
      order: 0,
    },
    {
      id: "list-2",
      title: "In Progress",
      order: 1,
    },
    {
      id: "list-3",
      title: "Done",
      order: 2,
    },
  ],
  tasks: [
    {
      id: "task-1",
      title: "Research project requirements",
      description: "Gather all necessary information about the project scope and requirements",
      dueDate: "2023-12-10",
      priority: "high",
      listId: "list-1",
    },
    {
      id: "task-2",
      title: "Create wireframes",
      description: "Design initial wireframes for the main pages",
      dueDate: "2023-12-15",
      priority: "medium",
      listId: "list-1",
    },
    {
      id: "task-3",
      title: "Setup project structure",
      description: "Initialize the project and set up the basic folder structure",
      dueDate: "2023-12-08",
      priority: "medium",
      listId: "list-2",
    },
    {
      id: "task-4",
      title: "Implement authentication",
      description: "Create login and registration functionality",
      dueDate: "2023-12-20",
      priority: "high",
      listId: "list-2",
    },
    {
      id: "task-5",
      title: "Write documentation",
      description: "Document the project setup and usage instructions",
      dueDate: "2023-12-25",
      priority: "low",
      listId: "list-3",
    },
  ],
}

