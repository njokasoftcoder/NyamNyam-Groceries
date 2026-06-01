/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'CASHIER' | 'INVENTORY_MANAGER';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
}

export type ProductUnit = 'KSh' | 'KG' | 'Piece' | 'Bag' | 'Crate' | 'Bunch';

export interface Product {
  id: string;
  name: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  unit: ProductUnit;
  reorderLevel: number;
  supplierId: string;
  imageUrl?: string;
  expiryDate?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  location: string;
  productsSupplied: string[];
}

export type PaymentMethod = 'CASH' | 'MPESA' | 'CREDIT';

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  cashierId: string;
  cashierName: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    mpesaCode?: string;
    customerId?: string;
    cashPaid?: number;
    changeReturned?: number;
  };
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string;
  outstandingBalance: number;
  loyaltyPoints: number;
  notes?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'CASH' | 'MPESA';
  mpesaCode?: string;
  timestamp: string;
}

export interface MpesaTransaction {
  id: string;
  checkoutRequestID?: string;
  customerPhone: string;
  amount: number;
  mpesaCode?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  timestamp: string;
}

export interface Debt {
  id: string;
  customerId: string;
  customerName: string;
  saleId: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  timestamp: string;
}

export interface Expense {
  id: string;
  category: 'TRANSPORT' | 'RENT' | 'WAGES' | 'ELECTRICITY' | 'PACKAGING' | 'MARKET_LEVY' | 'OTHER';
  description: string;
  amount: number;
  timestamp: string;
}

export interface CustomerFeedback {
  id: string;
  customerName: string;
  customerPhone: string;
  rating: number; // 1-5
  category: 'COMPLAINT' | 'SUGGESTION' | 'PRAISE' | 'QUALITY_ISSUE';
  message: string;
  status: 'PENDING' | 'RESOLVING' | 'RESOLVED';
  resolutionNote?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'LOW_STOCK' | 'DEBT_DUE' | 'MPESA_CONFIRMED' | 'SYSTEM' | 'FAILED_TX';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'SPOILAGE' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  userId: string;
  userName: string;
  timestamp: string;
}
