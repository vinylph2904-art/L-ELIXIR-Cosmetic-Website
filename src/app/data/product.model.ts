export interface Product {
  productId: string;
  name: string;
  brand: string;
  categoryName: string;
  description: string;
  ingredients: string[];
  images: string[];
  volume: string;
  routineStep: string;
  price: number;
  quantity?: number;
  stockQuantity: number;
  targetSkinTypes: string[];
  targetSkinProblems: string[];
  averageRating: number;
  reviewCount: number;
  collection?: string;
}