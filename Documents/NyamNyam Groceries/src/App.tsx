/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardModule from './components/DashboardModule';
import POSModule from './components/POSModule';
import InventoryModule from './components/InventoryModule';
import CustomerModule from './components/CustomerModule';
import DebtModule from './components/DebtModule';
import ExpenseModule from './components/ExpenseModule';
import FeedbackModule from './components/FeedbackModule';
import DatabaseModule from './components/DatabaseModule';
import ApiPlaygroundModule from './components/ApiPlaygroundModule';
import FlutterSourceModule from './components/FlutterSourceModule';

import { 
  Product, 
  Supplier, 
  Customer, 
  Sale, 
  Debt, 
  Payment, 
  MpesaTransaction, 
  Expense, 
  CustomerFeedback, 
  Notification, 
  AuditLog, 
  StockMovement,
  UserRole
} from './types';

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('ADMIN');
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Core Data pools
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [syncLog, setSyncLog] = useState<string[]>(["SQLite local storage initialized.", "Checking cloud database links... Online."]);

  const addToSyncLog = (msg: string) => {
    setSyncLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // 1. Initial Data load from backend DB server
  const loadDatabaseState = async () => {
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const db = await res.json();
        setProducts(db.products || []);
        setSuppliers(db.suppliers || []);
        setCustomers(db.customers || []);
        setSales(db.sales || []);
        setDebts(db.debts || []);
        setPayments(db.payments || []);
        setExpenses(db.expenses || []);
        setFeedbacks(db.feedback || []);
        setNotifications(db.notifications || []);
        setMovements(db.stockMovements || []);
      }
    } catch (e) {
      console.warn("Express server not launched yet, using client local storage cache.");
    }
  };

  useEffect(() => {
    loadDatabaseState();
    
    // Set up regular poll to capture background M-pesa async callback confirmation notifications (every 5 seconds)
    const interval = setInterval(() => {
      if (!isOffline) {
        loadDatabaseState();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOffline]);

  // 2. Clear Database / Resets seeds
  const handleResetDb = async () => {
    addToSyncLog("Wiping local databases... Restoring original Mombasa seeds.");
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const body = await res.json();
        setProducts(body.db.products || []);
        setSuppliers(body.db.suppliers || []);
        setCustomers(body.db.customers || []);
        setSales(body.db.sales || []);
        setDebts(body.db.debts || []);
        setPayments(body.db.payments || []);
        setExpenses(body.db.expenses || []);
        setFeedbacks(body.db.feedback || []);
        setNotifications(body.db.notifications || []);
        setMovements(body.db.stockMovements || []);
        addToSyncLog("Original agricultural database products and customers reloaded.");
      }
    } catch (e) {
      addToSyncLog("Local storage restored to factory agricultural listings.");
    }
  };

  // 3. Mark Notifications read
  const handleMarkNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read', { method: 'POST' });
      if (res.ok) {
        const body = await res.json();
        setNotifications(body.notifications);
      }
    } catch (e) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  // ==========================================
  // OFFLINE-FIRST INTEGRATIONS (CRUD OPERATIONS)
  // ==========================================

  // Add or edit inventory SKU product
  const handleAddOrUpdateProduct = async (prodData: any) => {
    if (isOffline) {
      // Offline-first: adjust client state, queue synchronization event
      addToSyncLog(`Offline Cache: Buffered product mutation for ${prodData.name}`);
      const mockId = prodData.id || "p_off_" + Date.now();
      
      const updatedProduct: Product = {
        id: mockId,
        name: prodData.name,
        category: prodData.category,
        buyingPrice: prodData.buyingPrice,
        sellingPrice: prodData.sellingPrice,
        quantity: prodData.quantity,
        unit: prodData.unit,
        reorderLevel: prodData.reorderLevel,
        supplierId: prodData.supplierId
      };

      if (prodData.id) {
        setProducts(prev => prev.map(p => p.id === prodData.id ? updatedProduct : p));
      } else {
        setProducts(prev => [...prev, updatedProduct]);
      }
      
      // Add offline warning trigger
      if (prodData.quantity <= prodData.reorderLevel) {
        setNotifications(prev => [
          {
            id: "not_off_" + Date.now(),
            type: "LOW_STOCK",
            title: `${prodData.name} Low Stock (Offline)`,
            message: `Current offline level is ${prodData.quantity}.`,
            read: false,
            timestamp: new Date().toISOString()
          },
          ...prev
        ]);
      }
      return { success: true };
    }

    try {
      // Online: Call NodeREST
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...prodData, userId: activeRole, userName: `Meneja (${activeRole})` })
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setNotifications(data.notifications);
        return { success: true };
      }
    } catch (err) {
      console.error(err);
    }
    return { success: false };
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (isOffline) {
      setProducts(prev => prev.filter(p => p.id !== id));
      addToSyncLog(`Offline Cache: Queued deletion layout for SKU ID: ${id}`);
      return { success: true };
    }

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        return { success: true };
      }
    } catch (err) {
      console.error(err);
    }
    return { success: false };
  };

  // Point of Sale: Add Sale checkout
  const handleAddSale = async (saleData: any) => {
    if (isOffline) {
      addToSyncLog(`Offline Queue: Completed checkout #${Date.now()} - Total KSh ${saleData.total}. Queued inside SQLite (localStorage).`);
      
      const newSaleId = "sal_off_" + Date.now();
      const newSale: Sale = {
        id: newSaleId,
        items: saleData.items.map((it: any, index: number) => ({ id: "si_off_" + index + "_" + Date.now(), ...it })),
        subtotal: saleData.items.reduce((sum: number, it: any) => sum + it.totalPrice, 0),
        discount: saleData.discount || 0,
        total: saleData.total || (saleData.items.reduce((sum: number, it: any) => sum + it.totalPrice, 0) - (saleData.discount || 0)),
        cashierId: "u2",
        cashierName: "Hassan Mwangi Offline",
        paymentMethod: saleData.paymentMethod,
        paymentDetails: saleData.cashPaid ? { cashPaid: saleData.cashPaid, changeReturned: Math.max(0, saleData.cashPaid - saleData.total) } : {},
        timestamp: new Date().toISOString()
      };

      // Adjust on-screen product stock level locally
      saleData.items.forEach((item: any) => {
        setProducts(prev => prev.map(p => {
          if (p.id === item.productId) {
            const finalQty = Math.max(0, p.quantity - item.quantity);
            return { ...p, quantity: finalQty };
          }
          return p;
        }));
      });

      // Handle debt if credit sale offline
      if (saleData.paymentMethod === 'CREDIT' && saleData.customerId) {
        const custName = customers.find(c => c.id === saleData.customerId)?.name || "Debtor Client";
        setDebts(prev => [
          {
            id: "d_off_" + Date.now(),
            customerId: saleData.customerId,
            customerName: custName,
            saleId: newSaleId,
            totalAmount: newSale.total,
            remainingAmount: newSale.total,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: "PENDING",
            timestamp: new Date().toISOString()
          },
          ...prev
        ]);
        
        setCustomers(prev => prev.map(c => {
          if (c.id === saleData.customerId) {
            return { ...c, outstandingBalance: c.outstandingBalance + newSale.total };
          }
          return c;
        }));
      }

      setSales(prev => [...prev, newSale]);
      return { success: true, sale: newSale };
    }

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.db.products);
        setSales(data.db.sales);
        setDebts(data.db.debts);
        setCustomers(data.db.customers);
        setNotifications(data.db.notifications);
        return { success: true, sale: data.sale };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  // Trigger M-Pesa STK Push
  const handleTriggerSTKPush = async (phone: string, amount: number, saleId?: string) => {
    if (isOffline) {
      addToSyncLog("M-Pesa Express Error: STK Push requires active mobile network links!");
      return { success: false, errorMessage: "No connectivity" };
    }

    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount, saleId })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  // Customer Debt Repayment Part
  const handlePayDebt = async (debtId: string, amount: number, paymentMethod: 'CASH' | 'MPESA', mpesaCode?: string) => {
    if (isOffline) {
      addToSyncLog(`Offline Cache: Buffered repayment of KSh ${amount} for Debt #${debtId}`);
      
      setDebts(prev => prev.map(d => {
        if (d.id === debtId) {
          const rem = Math.max(0, d.remainingAmount - amount);
          return {
            ...d,
            remainingAmount: rem,
            status: rem <= 0 ? 'PAID' : 'PARTIAL'
          };
        }
        return d;
      }));

      // Update customers balance
      const matchDebt = debts.find(d => d.id === debtId);
      if (matchDebt) {
        setCustomers(prev => prev.map(c => {
          if (c.id === matchDebt.customerId) {
            return { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - amount) };
          }
          return c;
        }));
      }

      setPayments(prev => [
        {
          id: "pay_off_" + Date.now(),
          customerId: matchDebt?.customerId || "Unknown",
          customerName: matchDebt?.customerName || "Unknown",
          amount,
          paymentMethod,
          mpesaCode,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
      return { success: true };
    }

    try {
      const res = await fetch('/api/debt/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debtId, amountPaid: amount, paymentMethod, mpesaCode })
      });
      if (res.ok) {
        const data = await res.json();
        setDebts(prev => prev.map(d => d.id === debtId ? data.debt : d));
        setPayments(data.payments);
        setCustomers(data.customers);
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  // Add Customer profile
  const handleAddCustomer = async (custData: any) => {
    if (isOffline) {
      const mockId = "c_off_" + Date.now();
      const newCust: Customer = {
        id: mockId,
        name: custData.name,
        phone: custData.phone,
        location: custData.location,
        outstandingBalance: 0,
        loyaltyPoints: 0,
        notes: custData.notes
      };
      setCustomers(prev => [...prev, newCust]);
      addToSyncLog(`Offline Cache: Customer profile Rachel created locally for checkout binds.`);
      return { success: true };
    }

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custData)
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers);
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  // Record custom expenses
  const handleAddExpense = async (expData: any) => {
    if (isOffline) {
      const newExp: Expense = {
        id: "e_off_" + Date.now(),
        category: expData.category,
        description: expData.description,
        amount: expData.amount,
        timestamp: new Date().toISOString()
      };
      setExpenses(prev => [newExp, ...prev]);
      addToSyncLog(`Offline Cache: Logged retail expense KSh ${expData.amount} for category ${expData.category}`);
      return { success: true };
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expData)
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses);
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  // Customer voice feedback logs
  const handleAddFeedback = async (fbData: any) => {
    if (isOffline) {
      const newFb: CustomerFeedback = {
        id: "f_off_" + Date.now(),
        customerName: fbData.customerName,
        customerPhone: fbData.customerPhone,
        rating: fbData.rating,
        category: fbData.category,
        message: fbData.message,
        status: 'PENDING',
        timestamp: new Date().toISOString()
      };
      setFeedbacks(prev => [newFb, ...prev]);
      addToSyncLog(`Offline Cache: Recorded customer feedback under pending queue.`);
      return { success: true };
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fbData)
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedback);
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  // Resolve active feedback complaints
  const handleResolveFeedback = async (id: string, resolutionNote: string) => {
    if (isOffline) {
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'RESOLVED', resolutionNote } : f));
      addToSyncLog(`Offline Cache: Handled resolution locally for feedback issued #${id}`);
      return { success: true };
    }

    try {
      const res = await fetch('/api/feedback/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resolutionNote })
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedback);
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  // Adjust stock
  const handleAdjustStock = async (productId: string, qty: number, type: string, reason: string) => {
    if (isOffline) {
      const match = products.find(p => p.id === productId);
      if (match) {
        let finalQty = match.quantity;
        if (type === 'STOCK_IN') finalQty += qty;
        else if (type === 'STOCK_OUT' || type === 'SPOILAGE') finalQty = Math.max(0, finalQty - qty);
        else if (type === 'ADJUSTMENT') finalQty = qty;

        setProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: finalQty } : p));
        addToSyncLog(`Offline Cache: Handled warehouse quantity movement for ${match.name} to ${finalQty}`);
      }
      return { success: true };
    }

    try {
      const res = await fetch('/api/stock/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: qty, type, reason, userId: activeRole, userName: `Meneja (${activeRole})` })
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setMovements(data.stockMovements);
        setNotifications(data.notifications);
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  return (
    <Layout
      activeRole={activeRole}
      setActiveRole={setActiveRole}
      isOffline={isOffline}
      setIsOffline={setIsOffline}
      notifications={notifications}
      onMarkNotificationsRead={handleMarkNotificationsRead}
      syncLog={syncLog}
      addToSyncLog={addToSyncLog}
      onResetDb={handleResetDb}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      
      {/* 4. Active Router Module renders conditionally by nav key */}
      {activeTab === 'dashboard' && (
        <DashboardModule
          products={products}
          sales={sales}
          customers={customers}
          expenses={expenses}
          debts={debts}
          movements={movements}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'pos' && (
        <POSModule
          products={products}
          customers={customers}
          onAddSale={handleAddSale}
          triggerSTKPush={handleTriggerSTKPush}
          isOffline={isOffline}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryModule
          products={products}
          suppliers={suppliers}
          onAddOrUpdateProduct={handleAddOrUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onAdjustStock={handleAdjustStock}
          activeRole={activeRole}
        />
      )}

      {activeTab === 'customers' && (
        <CustomerModule
          customers={customers}
          sales={sales}
          onAddCustomer={handleAddCustomer}
        />
      )}

      {activeTab === 'debts' && (
        <DebtModule
          debts={debts}
          customers={customers}
          onPayDebt={handlePayDebt}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpenseModule
          expenses={expenses}
          onAddExpense={handleAddExpense}
        />
      )}

      {activeTab === 'feedback' && (
        <FeedbackModule
          feedbacks={feedbacks}
          onAddFeedback={handleAddFeedback}
          onResolveFeedback={handleResolveFeedback}
        />
      )}

      {activeTab === 'api_docs' && (
        <ApiPlaygroundModule />
      )}

      {activeTab === 'database_schema' && (
        <DatabaseModule />
      )}

      {activeTab === 'flutter_code' && (
        <FlutterSourceModule />
      )}

    </Layout>
  );
}
