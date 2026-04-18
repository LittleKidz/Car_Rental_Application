export interface User {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: "user" | "admin";
  createdAt: string;
  token?: string;
}

export interface Provider {
  _id: string;
  name: string;
  address: string;
  telephone: string;
  id: string;
  cars?: Car[];
}

export interface Car {
  _id: string;
  brand: string;
  model: string;
  color: string;
  licensePlate: string;
  dailyRate: number;
  available: boolean;
  image?: string;
  provider: Provider | string;
  id: string;
}

export type PaymentStatus = "pending" | "paid" | "refunded";
export type RefundStatus = "none" | "requested" | "completed";

export interface Rental {
  _id: string;
  rentalDate: string;
  returnDate: string;
  user: User | string;
  provider: Provider | string;
  car?: Car | string;
  createAt: string;
  // Payment fields
  totalAmount: number;
  paymentStatus: PaymentStatus;
  refundStatus: RefundStatus;
  paidAt?: string;
  cancelledAt?: string;
}

export interface Notification {
  _id: string;
  user: string;
  rental?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
  msg?: string;
  token?: string;
}

export interface CartItem {
  provider: Provider;
  car: Car;
  rentalDate: string;
  returnDate: string;
}

export interface Booking {
  car: string;
  rentalDate: string;
  returnDate: string;
}
