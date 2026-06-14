export interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
}

export const RECIPES_DATABASE: Recipe[] = [
  {
    id: 1,
    name: 'Garlic Chicken Thighs Curry',
    ingredients: ['Chicken Thighs', 'Garlic', 'Onions', 'Tomatoes', 'Olive Oil', 'Bell Peppers'],
  },
  {
    id: 2,
    name: 'Healthy Zesty Spinach Salad',
    ingredients: ['Spinach', 'Lemon', 'Olive Oil', 'Avocado'],
  },
  {
    id: 3,
    name: 'Avocado & Cheddar Omelette',
    ingredients: ['Eggs', 'Avocado', 'Cheddar Cheese', 'Butter'],
  },
];
