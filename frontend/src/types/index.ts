export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  address?: {
    street?: string;
    city?: string;
    region?: string;
    country?: string;
  };
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  images: { public_id: string; url: string }[];
  stock: number;
  sku?: string;
  originCountry?: string;
  importationStatus: string;
  customsStatus?: string;
  isFeatured: boolean;
  isActive: boolean;
  ratings: number;
  numReviews: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export interface OrderItem {
  product: string | Product;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  user: User | string;
  orderItems: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    region: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  status: string;
  trackingNumber?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}
