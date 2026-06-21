export interface Product {
  productId: string;
  id: string;
  name: string;
  brand: string;
  categoryName: string;
  category: string;
  description: string;
  ingredients: string[];
  images: string[];
  image: string;
  volume: string;
  routineStep: string;
  price: number;
  quantity?: number;
  stockQuantity: number;
  targetSkinTypes: string[];
  targetSkinProblems: string[];
  tags: string[];
  averageRating: number;
  rating: number;
  reviewCount: number;
  reviews: number;
  collection?: string;
}