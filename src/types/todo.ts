export type Category = 'Work' | 'Personal' | 'Study' | 'Health' | 'Shopping';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  createdAt: string;
}

export type FilterType = 'all' | 'active' | 'completed';

