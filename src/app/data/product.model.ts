export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  volume: string;
  routineStep: string;
  price: number;
  quantity?: number;
  stockQuantity: number;
  targetSkinTypes: string[];
  targetSkinProblems: string[];
  rating: number;
  reviews: number;
}
