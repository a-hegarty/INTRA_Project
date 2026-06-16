export const API_BASE_URL = 'http://127.0.0.1:8000';

export interface BackendRecipe {
  id: number;
  name: string;
  time?: number;
  instructions?: string;
  ingredients: { id: number; name: string }[] | string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  image_url?: string | null;
}
