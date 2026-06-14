import { Product } from './product.model';

export const PRODUCTS: Product[] = [
  {
    id: 'radiance-serum',
    name: 'Radiance Elixir Serum',
    category: 'Serum',
    price: 1250000,
    image: 'https://via.placeholder.com/600x800.png?text=Radiance+Elixir+Serum',
    tags: ['Niacinamide', 'Brightening'],
    rating: 4.8,
    reviews: 120,
    description: 'Tinh chất dưỡng da chuyên sâu giúp làm sáng và trẻ hóa làn da. Công thức độc quyền kết hợp các hoạt chất vàng giúp tái tạo cấu trúc da từ sâu bên trong.',
    quantity: 1
  },
  {
    id: 'gentle-cleanse',
    name: 'Gentle Cleanse',
    category: 'Sữa rửa mặt',
    price: 220000,
    image: 'https://via.placeholder.com/600x800.png?text=Gentle+Cleanse',
    tags: ['Cleansing', 'Hydrating'],
    rating: 4.5,
    reviews: 98,
    description: 'Sữa rửa mặt dịu nhẹ, làm sạch sâu mà vẫn giữ được độ ẩm tự nhiên của da.',
    quantity: 1
  },
  {
    id: 'hydra-cream',
    name: 'Hydra Cream',
    category: 'Kem dưỡng',
    price: 790000,
    image: 'https://via.placeholder.com/600x800.png?text=Hydra+Cream',
    tags: ['Moisturizing', 'Repair'],
    rating: 4.7,
    reviews: 84,
    description: 'Kem dưỡng giúp cấp ẩm sâu và phục hồi hàng rào bảo vệ da cho làn da mềm mịn.',
    quantity: 1
  },
  {
    id: 'glow-mask',
    name: 'Glow Mask',
    category: 'Mặt nạ',
    price: 120000,
    image: 'https://via.placeholder.com/600x800.png?text=Glow+Mask',
    tags: ['Mask', 'Brightening'],
    rating: 4.6,
    reviews: 64,
    description: 'Mặt nạ làm sáng da ngay tức thì với công thức dưỡng ẩm cao.',
    quantity: 1
  }
];
