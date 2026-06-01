/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Ensure DB Directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial seed data
const getInitialSeedData = () => {
  return {
    products: [
      { id: "p1", name: "Tomatoes (Nyanya)", category: "Vegetables", buyingPrice: 50, sellingPrice: 80, quantity: 120, unit: "KG", reorderLevel: 20, supplierId: "s1", imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=150" },
      { id: "p2", name: "Potatoes (Waruzi)", category: "Vegetables", buyingPrice: 60, sellingPrice: 90, quantity: 15, unit: "Bag", reorderLevel: 25, supplierId: "s1", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150" },
      { id: "p3", name: "Onions (Kitunguu)", category: "Vegetables", buyingPrice: 70, sellingPrice: 110, quantity: 80, unit: "KG", reorderLevel: 15, supplierId: "s1", imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?w=150" },
      { id: "p4", name: "Sukuma Wiki (Collard)", category: "Vegetables", buyingPrice: 20, sellingPrice: 40, quantity: 200, unit: "Bunch", reorderLevel: 30, supplierId: "s2", imageUrl: "https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=150" },
      { id: "p5", name: "Spinach (Mchicha)", category: "Vegetables", buyingPrice: 25, sellingPrice: 50, quantity: 150, unit: "Bunch", reorderLevel: 20, supplierId: "s2", imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150" },
      { id: "p6", name: "Cabbage", category: "Vegetables", buyingPrice: 30, sellingPrice: 60, quantity: 45, unit: "Piece", reorderLevel: 10, supplierId: "s1", imageUrl: "https://images.unsplash.com/photo-1611105637889-3dfa19363065?w=150" },
      { id: "p7", name: "Bananas (Ndizi)", category: "Fruits", buyingPrice: 5, sellingPrice: 10, quantity: 500, unit: "Piece", reorderLevel: 50, supplierId: "s2", imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=150" },
      { id: "p8", name: "Matoke (Green Banana)", category: "Fruits", buyingPrice: 150, sellingPrice: 250, quantity: 8, unit: "Bunch", reorderLevel: 12, supplierId: "s2", imageUrl: "https://images.unsplash.com/photo-1566393028639-d108a42c46a7?w=150" },
      { id: "p9", name: "Pineapples", category: "Fruits", buyingPrice: 80, sellingPrice: 150, quantity: 30, unit: "Piece", reorderLevel: 8, supplierId: "s2", imageUrl: "https://images.unsplash.com/photo-1550258114-28ab35fc9757?w=150" },
      { id: "p10", name: "Watermelons", category: "Fruits", buyingPrice: 100, sellingPrice: 200, quantity: 25, unit: "Piece", reorderLevel: 10, supplierId: "s2", imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150" },
      { id: "p11", name: "Mombasa Rice (Shujaa)", category: "Cereals", buyingPrice: 120, sellingPrice: 160, quantity: 15, unit: "Bag", reorderLevel: 5, supplierId: "s3", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150" },
      { id: "p12", name: "Yellow Beans", category: "Cereals", buyingPrice: 140, sellingPrice: 200, quantity: 90, unit: "KG", reorderLevel: 20, supplierId: "s3" },
      { id: "p13", name: "Maize Flour (Pembe)", category: "Cereals", buyingPrice: 100, sellingPrice: 130, quantity: 12, unit: "Crate", reorderLevel: 10, supplierId: "s3" },
    ],
    suppliers: [
      { id: "s1", name: "Kongowea Wholesale Hub", phone: "+254 711 000 111", location: "Kongowea Market, Mombasa", productsSupplied: ["p1", "p2", "p3", "p6"] },
      { id: "s2", name: "Coast Farmers Cooperative", phone: "+254 722 000 222", location: "Mtwapa, Kilifi", productsSupplied: ["p4", "p5", "p7", "p8", "p9", "p10"] },
      { id: "s3", name: "Mombasa Grain Distributors", phone: "+254 733 000 333", location: "Shimanzi, Mombasa", productsSupplied: ["p11", "p12", "p13"] }
    ],
    customers: [
      { id: "c1", name: "Amina Juma", phone: "+254 712 345 678", location: "Likoni, Mombasa", outstandingBalance: 450, loyaltyPoints: 125, notes: "Reliable customer, pays debts within 10 days" },
      { id: "c2", name: "Ali Omar", phone: "+254 723 456 789", location: "Mombasa Island", outstandingBalance: 0, loyaltyPoints: 85, notes: "Prefers Onions and Bananas" },
      { id: "c3", name: "Brenda Waweru", phone: "+254 734 567 890", location: "Nyali, Mombasa", outstandingBalance: 1200, loyaltyPoints: 400, notes: "Hotel owner, purchases in bulk crates" },
      { id: "c4", name: "Peter Mwendwa", phone: "+254 745 678 901", location: "Bamburi, Mombasa", outstandingBalance: 0, loyaltyPoints: 12, notes: "Walk-in retail client" }
    ],
    sales: [
      {
        id: "sal1",
        items: [
          { id: "si1", productId: "p1", productName: "Tomatoes (Nyanya)", quantity: 2, unitPrice: 80, totalPrice: 160 },
          { id: "si2", productId: "p3", productName: "Onions (Kitunguu)", quantity: 1, unitPrice: 110, totalPrice: 110 }
        ],
        subtotal: 270,
        discount: 0,
        total: 270,
        cashierId: "u2",
        cashierName: "Hassan Mwangi",
        paymentMethod: "CASH",
        paymentDetails: { cashPaid: 500, changeReturned: 230 },
        timestamp: "2026-06-01T07:30:00Z"
      },
      {
        id: "sal2",
        items: [
          { id: "si3", productId: "p8", productName: "Matoke (Green Banana)", quantity: 2, unitPrice: 250, totalPrice: 500 }
        ],
        subtotal: 500,
        discount: 50,
        total: 450,
        cashierId: "u2",
        cashierName: "Hassan Mwangi",
        paymentMethod: "CREDIT",
        paymentDetails: { customerId: "c1" },
        timestamp: "2026-06-01T08:15:00Z"
      }
    ],
    debts: [
      { id: "d1", customerId: "c1", customerName: "Amina Juma", saleId: "sal2", totalAmount: 450, remainingAmount: 450, dueDate: "2026-06-15", status: "PENDING", timestamp: "2026-06-01T08:15:00Z" },
      { id: "d2", customerId: "c3", customerName: "Brenda Waweru", saleId: "manual_old", totalAmount: 1200, remainingAmount: 1200, dueDate: "2026-05-25", status: "PENDING", timestamp: "2026-05-18T14:20:00Z" }
    ],
    payments: [
      { id: "pay1", customerId: "c1", customerName: "Amina Juma", amount: 150, paymentMethod: "MPESA", mpesaCode: "QRF6JKL90M", timestamp: "2026-05-29T10:00:00Z" }
    ],
    mpesaTransactions: [
      { id: "m1", customerPhone: "+254712345678", amount: 150, mpesaCode: "QRF6JKL90M", status: "SUCCESS", timestamp: "2026-05-29T10:00:00Z" }
    ],
    expenses: [
      { id: "e1", category: "TRANSPORT", description: "Matatu TukTuk transport from Kongowea Wholesale Hub", amount: 600, timestamp: "2026-06-01T05:30:00Z" },
      { id: "e2", category: "MARKET_LEVY", description: "Kongowea Market entry levy/cess ticket", amount: 150, timestamp: "2026-06-01T06:00:00Z" },
      { id: "e3", category: "WAGES", description: "Daily payment for loader casual staff", amount: 500, timestamp: "2026-05-31T18:00:00Z" }
    ],
    feedback: [
      { id: "f1", customerName: "Fatuma Ali", customerPhone: "+254 755 123 456", rating: 4, category: "SUGGESTION", message: "Inawezekana kuleta mihogo safi (cassava) kutoka Shimba Hills? Tutaishukuru sana.", status: "RESOLVED", resolutionNote: "Configured local supplier for biological cassava. Added to list.", timestamp: "2026-05-30T11:00:00Z" },
      { id: "f2", customerName: "John Kazungu", customerPhone: "+254 721 999 000", rating: 2, category: "QUALITY_ISSUE", message: "Nyanya nizonunua jana zilikuwa zimeoza kwa ndani. Tafadhali ziangalieni.", status: "PENDING", timestamp: "2026-06-01T09:10:00Z" }
    ],
    notifications: [
      { id: "n1", type: "LOW_STOCK", title: "Green Banana (Matoke) Low Stock", message: "Only 8 bunches left! Reorder point is 12 bunches.", read: false, timestamp: "2026-06-01T08:00:00Z" },
      { id: "n2", type: "DEBT_DUE", title: "Brenda Waweru Debt is Overdue", message: "KSh 1,200 is overdue since May 25, 2026.", read: false, timestamp: "2026-05-26T06:00:00Z" }
    ],
    stockMovements: [
      { id: "sm1", productId: "p8", productName: "Matoke (Green Banana)", type: "STOCK_OUT", quantity: 2, reason: "Sold via POS (Bill #sal2)", userId: "u2", userName: "Hassan Mwangi", timestamp: "2026-06-01T08:15:00Z" },
      { id: "sm2", productId: "p1", productName: "Tomatoes (Nyanya)", type: "STOCK_OUT", quantity: 2, reason: "Sold via POS (Bill #sal1)", userId: "u2", userName: "Hassan Mwangi", timestamp: "2026-06-01T07:30:00Z" },
      { id: "sm3", productId: "p2", productName: "Potatoes (Waruzi)", type: "SPOILAGE", quantity: 1, reason: "Mold damage due to dampness", userId: "u3", userName: "Asha Mwana", timestamp: "2026-05-31T10:00:00Z" }
    ],
    auditLogs: [
      { id: "a1", userId: "u1", userName: "Nyamu (Admin)", action: "STOCK_INIT", details: "Initialized inventory system with Kongowea and Coast partners", timestamp: "2026-05-28T09:00:00Z" }
    ]
  };
};

// Database read/write utility
const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read database, returning in-memory fallback", error);
    return getInitialSeedData();
  }
};

const writeDB = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Failed to write to database on disk", error);
    return false;
  }
};

// REST APIs
// Get full snapshot
app.get("/api/db", (req, res) => {
  const db = readDB();
  res.json(db);
});

// Reset database
app.post("/api/reset", (req, res) => {
  const initial = getInitialSeedData();
  writeDB(initial);
  res.json({ message: "Database restored to defaults", db: initial });
});

// Create or update Product
app.post("/api/products", (req, res) => {
  const db = readDB();
  const product = req.body;
  
  if (!product.id) {
    product.id = "p" + (db.products.length + 1) + "_" + Math.floor(Math.random() * 1000);
    db.products.push(product);
    // Audit & Stock movement
    db.stockMovements.push({
      id: "sm_" + Date.now(),
      productId: product.id,
      productName: product.name,
      type: "STOCK_IN",
      quantity: product.quantity,
      reason: "Initial stock load for new product",
      userId: req.body.userId || "u1",
      userName: req.body.userName || "Admin",
      timestamp: new Date().toISOString()
    });
    db.auditLogs.push({
      id: "aud_" + Date.now(),
      userId: req.body.userId || "u1",
      userName: req.body.userName || "Admin",
      action: "PRODUCT_ADD",
      details: `Added new product ${product.name} with quantity ${product.quantity}`,
      timestamp: new Date().toISOString()
    });
  } else {
    const idx = db.products.findIndex((p: any) => p.id === product.id);
    if (idx !== -1) {
      const oldQty = db.products[idx].quantity;
      db.products[idx] = { ...db.products[idx], ...product };
      
      // If quantity changed, log movement
      if (product.quantity !== oldQty) {
        db.stockMovements.push({
          id: "sm_" + Date.now(),
          productId: product.id,
          productName: product.name,
          type: product.quantity > oldQty ? "STOCK_IN" : "STOCK_OUT",
          quantity: Math.abs(product.quantity - oldQty),
          reason: "Manual adjustment/update",
          userId: req.body.userId || "u1",
          userName: req.body.userName || "Admin",
          timestamp: new Date().toISOString()
        });
      }
      db.auditLogs.push({
        id: "aud_" + Date.now(),
        userId: req.body.userId || "u1",
        userName: req.body.userName || "Admin",
        action: "PRODUCT_EDIT",
        details: `Edited product params for ${product.name}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Low Stock Trigger Check during edit/create
  if (product.quantity <= product.reorderLevel) {
    const alertId = "n_" + product.id + "_" + Date.now();
    // Prevent duplicate unread notifications
    const exists = db.notifications.some((n: any) => n.title.includes(product.name) && !n.read);
    if (!exists) {
      db.notifications.unshift({
        id: alertId,
        type: "LOW_STOCK",
        title: `${product.name} Low Stock Warning`,
        message: `Current stock of ${product.name} is ${product.quantity} ${product.unit}. Reorder level is ${product.reorderLevel}.`,
        read: false,
        timestamp: new Date().toISOString()
      });
    }
  }

  writeDB(db);
  res.json({ success: true, product, products: db.products, notifications: db.notifications });
});

// Delete Product
app.delete("/api/products/:id", (req, res) => {
  const db = readDB();
  const id = req.params.id;
  const idx = db.products.findIndex((p: any) => p.id === id);
  if (idx !== -1) {
    const pName = db.products[idx].name;
    db.products.splice(idx, 1);
    db.auditLogs.push({
      id: "aud_" + Date.now(),
      userId: "u1",
      userName: "Admin",
      action: "PRODUCT_DELETE",
      details: `Deleted product: ${pName} (${id})`,
      timestamp: new Date().toISOString()
    });
    writeDB(db);
    return res.json({ success: true, products: db.products });
  }
  res.status(404).json({ error: "Product not found" });
});

// Create Customer
app.post("/api/customers", (req, res) => {
  const db = readDB();
  const customer = req.body;
  if (!customer.id) {
    customer.id = "c" + (db.customers.length + 1) + "_" + Math.floor(Math.random() * 100);
    customer.outstandingBalance = 0;
    customer.loyaltyPoints = 0;
    db.customers.push(customer);
  } else {
    const idx = db.customers.findIndex((c: any) => c.id === customer.id);
    if (idx !== -1) {
      db.customers[idx] = { ...db.customers[idx], ...customer };
    }
  }
  writeDB(db);
  res.json({ success: true, customers: db.customers });
});

// Record Sale (POS Operations)
app.post("/api/sales", (req, res) => {
  const db = readDB();
  const { items, discount, paymentMethod, mpesaCode, customerId, cashierId, cashierName, cashPaid } = req.body;

  const subtotal = items.reduce((sum: number, it: any) => sum + it.totalPrice, 0);
  const total = subtotal - (discount || 0);

  const saleId = "sal" + (db.sales.length + 1) + "_" + Math.floor(Math.random() * 1000);
  
  // Create sale object
  const sale: any = {
    id: saleId,
    items,
    subtotal,
    discount: discount || 0,
    total,
    cashierId: cashierId || "u2",
    cashierName: cashierName || "Cashier",
    paymentMethod,
    paymentDetails: {},
    timestamp: new Date().toISOString()
  };

  // Adjust Inventory Stock Level
  items.forEach((item: any) => {
    const prod = db.products.find((p: any) => p.id === item.productId);
    if (prod) {
      prod.quantity = Math.max(0, prod.quantity - item.quantity);
      
      // Stock Movement Log
      db.stockMovements.push({
        id: "sm_" + Math.random().toString(36).substr(2, 9),
        productId: prod.id,
        productName: prod.name,
        type: "STOCK_OUT",
        quantity: item.quantity,
        reason: `POS checkout transaction #${saleId}`,
        userId: cashierId || "u2",
        userName: cashierName || "Cashier",
        timestamp: new Date().toISOString()
      });

      // Notification review for reorder
      if (prod.quantity <= prod.reorderLevel) {
        db.notifications.unshift({
          id: "n_" + prod.id + "_" + Date.now(),
          type: "LOW_STOCK",
          title: `${prod.name} Stock Trigger Alert`,
          message: `Stock level fell to ${prod.quantity} ${prod.unit} [Reorder Level: ${prod.reorderLevel}]. Please stock-in.`,
          read: false,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // Flow customer outcomes & payments
  if (paymentMethod === "CREDIT") {
    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required for Credit transactions" });
    }
    const cust = db.customers.find((c: any) => c.id === customerId);
    if (cust) {
      cust.outstandingBalance += total;
      cust.loyaltyPoints += Math.floor(total / 100); // 1 point per 100 KSh
      sale.paymentDetails.customerId = customerId;
      
      // Debt Record
      db.debts.push({
        id: "d_" + Date.now(),
        customerId,
        customerName: cust.name,
        saleId,
        totalAmount: total,
        remainingAmount: total,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days credit
        status: "PENDING",
        timestamp: new Date().toISOString()
      });

      db.notifications.unshift({
        id: "n_debt_" + Date.now(),
        type: "DEBT_DUE",
        title: `New Credit debt recorded: ${cust.name}`,
        message: `KSh ${total.toLocaleString()} added on credit, maturing in 14 days.`,
        read: false,
        timestamp: new Date().toISOString()
      });
    }
  } else if (paymentMethod === "CASH") {
    const paid = cashPaid || total;
    sale.paymentDetails = {
      cashPaid: paid,
      changeReturned: Math.max(0, paid - total)
    };
    if (customerId) {
      const cust = db.customers.find((c: any) => c.id === customerId);
      if (cust) cust.loyaltyPoints += Math.floor(total / 100);
    }
  } else if (paymentMethod === "MPESA") {
    sale.paymentDetails.mpesaCode = mpesaCode || "WAIT_STK";
    if (customerId) {
      const cust = db.customers.find((c: any) => c.id === customerId);
      if (cust) cust.loyaltyPoints += Math.floor(total / 100);
    }
  }

  // Record Audit log
  db.auditLogs.push({
    id: "aud_" + Date.now(),
    userId: cashierId || "u2",
    userName: cashierName || "Cashier",
    action: "SALE_RECORD",
    details: `Completed sale #${saleId} - Subtotal KSh ${subtotal}, Total KSh ${total} with ${paymentMethod}`,
    timestamp: new Date().toISOString()
  });

  db.sales.push(sale);
  writeDB(db);

  res.json({ success: true, sale, db });
});

// Debt Reimbursements
app.post("/api/debt/pay", (req, res) => {
  const db = readDB();
  const { debtId, amountPaid, paymentMethod, mpesaCode } = req.body;

  const debt = db.debts.find((d: any) => d.id === debtId);
  if (!debt) return res.status(404).json({ error: "Debt schedule not found" });

  const amountToApply = Math.min(debt.remainingAmount, amountPaid);
  debt.remainingAmount -= amountToApply;
  debt.status = debt.remainingAmount <= 0 ? "PAID" : "PARTIAL";

  // Reduce customer balance
  const cust = db.customers.find((c: any) => c.id === debt.customerId);
  if (cust) {
    cust.outstandingBalance = Math.max(0, cust.outstandingBalance - amountToApply);
  }

  // Create payment record
  const paymentId = "pay_" + Date.now();
  db.payments.push({
    id: paymentId,
    customerId: debt.customerId,
    customerName: debt.customerName,
    amount: amountToApply,
    paymentMethod,
    mpesaCode,
    timestamp: new Date().toISOString()
  });

  // Mpesa transaction history update
  if (paymentMethod === "MPESA" && mpesaCode) {
    db.mpesaTransactions.push({
      id: "m_" + Date.now(),
      customerPhone: cust ? cust.phone : "+254700000000",
      amount: amountToApply,
      mpesaCode,
      status: "SUCCESS",
      timestamp: new Date().toISOString()
    });
  }

  db.auditLogs.push({
    id: "aud_" + Date.now(),
    userId: "u2",
    userName: "Attendant",
    action: "DEBT_PAYMENT",
    details: `Received payment of KSh ${amountToApply} for debt of ${debt.customerName}`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.json({ success: true, debt, payments: db.payments, customers: db.customers });
});

// Process Simulated M-Pesa STK Push
app.post("/api/mpesa/stkpush", (req, res) => {
  const db = readDB();
  const { phone, amount, saleId } = req.body;
  const checkoutId = "ws_CO_" + Math.floor(Math.random() * 900000000 + 100000000);
  
  // Track this pending MPESA transaction
  const tx: any = {
    id: "mtx_" + Date.now(),
    checkoutRequestID: checkoutId,
    customerPhone: phone,
    amount,
    status: "PENDING",
    timestamp: new Date().toISOString()
  };
  
  db.mpesaTransactions.push(tx);
  writeDB(db);

  // Trigger simulated STK push confirmation timeout (4 seconds)
  setTimeout(() => {
    const lateDb = readDB();
    const activeTxIdx = lateDb.mpesaTransactions.findIndex((t: any) => t.checkoutRequestID === checkoutId);
    if (activeTxIdx !== -1) {
      const randomCode = "KSh" + Math.random().toString(36).substring(2, 10).toUpperCase();
      lateDb.mpesaTransactions[activeTxIdx].status = "SUCCESS";
      lateDb.mpesaTransactions[activeTxIdx].mpesaCode = randomCode;

      // Update associated sale with the mpesa code
      if (saleId) {
        const associatedSale = lateDb.sales.find((s: any) => s.id === saleId);
        if (associatedSale && associatedSale.paymentDetails) {
          associatedSale.paymentDetails.mpesaCode = randomCode;
          associatedSale.paymentDetails.status = "SUCCESS";
        }
      }

      // Append Success Notification
      lateDb.notifications.unshift({
        id: "not_mpesa_" + Date.now(),
        type: "MPESA_CONFIRMED",
        title: "Daraja M-Pesa Payment Confirmed",
        message: `KSh ${amount.toLocaleString()} received from ${phone}. Code: ${randomCode}.`,
        read: false,
        timestamp: new Date().toISOString()
      });

      writeDB(lateDb);
    }
  }, 4000);

  res.json({ success: true, checkoutRequestID: checkoutId, status: "PENDING" });
});

// Submit Feedback
app.post("/api/feedback", (req, res) => {
  const db = readDB();
  const fb = req.body;
  fb.id = "f" + (db.feedback.length + 1) + "_" + Math.floor(Math.random() * 100);
  fb.status = "PENDING";
  fb.timestamp = new Date().toISOString();
  db.feedback.unshift(fb);
  writeDB(db);
  res.json({ success: true, feedback: db.feedback });
});

// Resolve Feedback
app.post("/api/feedback/resolve", (req, res) => {
  const db = readDB();
  const { id, resolutionNote } = req.body;
  const idx = db.feedback.findIndex((f: any) => f.id === id);
  if (idx !== -1) {
    db.feedback[idx].status = "RESOLVED";
    db.feedback[idx].resolutionNote = resolutionNote;
    db.auditLogs.push({
      id: "aud_" + Date.now(),
      userId: "u1",
      userName: "Admin",
      action: "FEEDBACK_RESOLVE",
      details: `Resolved feedback #${id} with message: ${resolutionNote}`,
      timestamp: new Date().toISOString()
    });
    writeDB(db);
    return res.json({ success: true, feedback: db.feedback });
  }
  res.status(404).json({ error: "Feedback not found" });
});

// Add Expense record
app.post("/api/expenses", (req, res) => {
  const db = readDB();
  const ex = req.body;
  ex.id = "e_" + Date.now();
  ex.timestamp = new Date().toISOString();
  db.expenses.unshift(ex);
  
  db.auditLogs.push({
    id: "aud_" + Date.now(),
    userId: "u1",
    userName: "Admin",
    action: "EXPENSE_ADD",
    details: `Added business expense for ${ex.category} amounting to KSh ${ex.amount}`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.json({ success: true, expenses: db.expenses });
});

// Notifications clear mark
app.post("/api/notifications/read", (req, res) => {
  const db = readDB();
  db.notifications.forEach((n: any) => n.read = true);
  writeDB(db);
  res.json({ success: true, notifications: db.notifications });
});

// Add Manual Stock Actions / Wastaged Adjustments
app.post("/api/stock/adjust", (req, res) => {
  const db = readDB();
  const { productId, quantity, type, reason, userId, userName } = req.body;

  const prod = db.products.find((p: any) => p.id === productId);
  if (!prod) return res.status(404).json({ error: "Product not found" });

  const previousQty = prod.quantity;
  let newQty = previousQty;

  if (type === "STOCK_IN") {
    newQty += quantity;
  } else if (type === "STOCK_OUT" || type === "SPOILAGE") {
    newQty = Math.max(0, previousQty - quantity);
  } else if (type === "ADJUSTMENT") {
    newQty = quantity;
  }

  prod.quantity = newQty;

  // Insert Stock Movement
  const moveId = "sm_" + Date.now();
  db.stockMovements.push({
    id: moveId,
    productId,
    productName: prod.name,
    type,
    quantity,
    reason,
    userId: userId || "u1",
    userName: userName || "Operator",
    timestamp: new Date().toISOString()
  });

  // Audit Log
  db.auditLogs.push({
    id: "aud_" + Date.now(),
    userId: userId || "u1",
    userName: userName || "Operator",
    action: "STOCK_ADJUSTMENT",
    details: `Adjusted ${prod.name} from ${previousQty} to ${newQty} via action ${type}`,
    timestamp: new Date().toISOString()
  });

  // Re-verify low stock alert
  if (prod.quantity <= prod.reorderLevel) {
    db.notifications.unshift({
      id: "n_" + prod.id + "_" + Date.now(),
      type: "LOW_STOCK",
      title: `${prod.name} Stock Level Low`,
      message: `Stock fell to ${prod.quantity} ${prod.unit} [Reorder point ${prod.reorderLevel}].`,
      read: false,
      timestamp: new Date().toISOString()
    });
  }

  writeDB(db);
  res.json({ success: true, products: db.products, stockMovements: db.stockMovements, notifications: db.notifications });
});


// Full-Stack App configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NyamNyam Backend Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
