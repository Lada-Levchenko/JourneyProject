declare global {
  interface ITask {
    id: string;
    title: string;
    completed: boolean;
  }

  interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
  }
}

// This makes sure the file is treated as a module.
export {};
