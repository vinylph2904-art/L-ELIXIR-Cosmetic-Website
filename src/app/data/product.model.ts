export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  tags: string[];
  rating: number;
  reviews: number;
  description: string;
  quantity?: number;
}
