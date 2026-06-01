/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Copy, Check, Info, Library } from 'lucide-react';

export default function DatabaseModule() {
  const [copied, setCopied] = useState(false);
  const [activeTable, setActiveTable] = useState<string>('products');

  const sqlDDL = `-- ====================================================
-- NYAMNYAM GROCERIES - MOMBASA COUNTY RETAIL DATABASE
-- TARGET PLATFORM: PostgreSQL 15+ / SQLite 3
-- ====================================================

-- 1. ROLE-BASED ACCESS CONTROL ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN', 'CASHIER', 'INVENTORY_MANAGER');
CREATE TYPE movement_type AS ENUM ('STOCK_IN', 'STOCK_OUT', 'SPOILAGE', 'ADJUSTMENT');
CREATE TYPE payment_method AS ENUM ('CASH', 'MPESA', 'CREDIT');

-- 2. USERS TABLE
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role user_role DEFAULT 'CASHIER',
    password_hash VARCHAR(255) NOT NULL, -- PIN / Hash encrypted
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SUPPLIERS TABLE
CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CATEGORIES TABLE
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- 5. PRODUCTS TABLE (Inventory Core)
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    buying_price NUMERIC(10, 2) NOT NULL CHECK (buying_price >= 0),
    selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= buying_price),
    quantity_available NUMERIC(10, 2) DEFAULT 0 CHECK (quantity_available >= 0),
    unit VARCHAR(20) NOT NULL, -- 'KG', 'Piece', 'Bag', 'Crate', 'Bunch'
    reorder_level NUMERIC(10, 2) DEFAULT 10,
    supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE SET NULL,
    image_url TEXT,
    expiry_date DATE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CUSTOMERS TABLE
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    location VARCHAR(150),
    outstanding_balance NUMERIC(10, 2) DEFAULT 0.00,
    loyalty_points INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SALES TABLE
CREATE TABLE sales (
    id VARCHAR(50) PRIMARY KEY,
    subtotal NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL,
    cashier_id VARCHAR(50) REFERENCES users(id),
    payment_method payment_method DEFAULT 'CASH',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. SALE_ITEMS TABLE
CREATE TABLE sale_items (
    id VARCHAR(50) PRIMARY KEY,
    sale_id VARCHAR(50) REFERENCES sales(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

-- 9. DEBTS TABLE (Credit tracker)
CREATE TABLE debts (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE CASCADE,
    sale_id VARCHAR(50) REFERENCES sales(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    remaining_amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PARTIAL', 'PAID'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PAYMENTS LOGGER TABLE (Part debt payoffs)
CREATE TABLE payments (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(id),
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- 'CASH', 'MPESA'
    mpesa_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. MPESA_TRANSACTIONS (STK Confirmation History)
CREATE TABLE mpesa_transactions (
    id SERIAL PRIMARY KEY,
    checkout_request_id VARCHAR(100) UNIQUE,
    customer_phone VARCHAR(20) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    mpesa_code VARCHAR(30) UNIQUE,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. EXPENSES TABLE
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'TRANSPORT', 'RENT', 'WAGES', 'ELECTRICITY', 'MARKET_LEVY'
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. FEEDBACK TABLE
CREATE TABLE customer_feedback (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'RESOLVING', 'RESOLVED'
    resolution_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. AUDIT_LOGS
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. STOCK_MOVEMENTS
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    movement_type movement_type_enum NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    user_id VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- PERFORMANCE INDEXES DESIGN FOR SPEED IN MOMBASA TILLs
-- ====================================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_quantity ON products(quantity_available) WHERE quantity_available <= reorder_level;
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_due ON debts(due_date);
CREATE INDEX idx_mpesa_checkout ON mpesa_transactions(checkout_request_id);
CREATE INDEX idx_stock_product ON stock_movements(product_id);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlDDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tables = {
    products: [
      { field: 'id', type: 'VARCHAR(50)', key: 'PK', desc: 'Unique product SKU code line' },
      { field: 'name', type: 'VARCHAR(100)', key: 'NOT NULL', desc: 'Standard or local produce name (Tomato / Nyanya)' },
      { field: 'buying_price', type: 'NUMERIC(10,2)', key: 'NOT NULL', desc: 'Wholesale acquisition cost at Kongowea Hub' },
      { field: 'selling_price', type: 'NUMERIC(10,2)', key: 'NOT NULL', desc: 'Target local retail price' },
      { field: 'quantity_available', type: 'NUMERIC(10,2)', key: 'DEFAULT 0', desc: 'Inventory weight or piece level' },
      { field: 'unit', type: 'VARCHAR(20)', key: 'NOT NULL', desc: 'Measure system e.g. KG, Bunch, Piece' },
      { field: 'reorder_level', type: 'NUMERIC(10,2)', key: 'DEFAULT 10', desc: 'Product critical stock warning trigger point' },
      { field: 'supplier_id', type: 'VARCHAR(50)', key: 'FK ──────> suppliers', desc: 'Supplying wholesaler relation' }
    ],
    sales: [
      { field: 'id', type: 'VARCHAR(50)', key: 'PK', desc: 'POS receipt bill ID' },
      { field: 'subtotal', type: 'NUMERIC(10,2)', key: 'NOT NULL', desc: 'Cart aggregate sum prior to discount' },
      { field: 'discount', type: 'NUMERIC(10,2)', key: 'DEFAULT 0', desc: 'Retailer discount deduction' },
      { field: 'total', type: 'NUMERIC(10,2)', key: 'NOT NULL', desc: 'Final net cash value processed' },
      { field: 'cashier_id', type: 'VARCHAR(50)', key: 'FK ──────> users', desc: 'Checked out by cashier operator' },
      { field: 'payment_method', type: 'VARCHAR(20)', key: 'ENUM', desc: 'CASH, MPESA or CREDIT' }
    ],
    debts: [
      { field: 'id', type: 'VARCHAR(50)', key: 'PK', desc: 'Unique credit tracking schedule ID' },
      { field: 'customer_id', type: 'VARCHAR(50)', key: 'FK ──────> customers', desc: 'Target consumer relation' },
      { field: 'sale_id', type: 'VARCHAR(50)', key: 'FK ──────> sales', desc: 'Originating sale record relation' },
      { field: 'remaining_amount', type: 'NUMERIC(10,2)', key: 'NOT NULL', desc: 'Outstanding unpaid balance due' },
      { field: 'due_date', type: 'DATE', key: 'NOT NULL', desc: 'Account repayment maturity limit' },
      { field: 'status', type: 'VARCHAR(20)', key: 'DEFAULT PENDING', desc: 'PENDING, PARTIAL, PAID indicator' }
    ],
    mpesa_transactions: [
      { field: 'id', type: 'SERIAL', key: 'PK', desc: 'Internal checkout ledger row' },
      { field: 'checkout_request_id', type: 'VARCHAR(100)', key: 'UNIQUE', desc: 'Safaricom Daraja Express Query UID' },
      { field: 'customer_phone', type: 'VARCHAR(20)', key: 'NOT NULL', desc: 'Debiting mobile phone digit line' },
      { field: 'amount', type: 'NUMERIC(10,2)', key: 'NOT NULL', desc: 'STK transaction cost target' },
      { field: 'mpesa_code', type: 'VARCHAR(30)', key: 'UNIQUE', desc: 'Actual validated SMS receipt code (e.g. SFT4W)' },
      { field: 'status', type: 'VARCHAR(20)', key: 'DEFAULT PENDING', desc: 'PENDING, SUCCESS, or FAILED status' }
    ]
  };

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      
      {/* Title page */}
      <div>
        <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-1">
          <Database className="h-4 w-4 text-emerald-450" />
          {activeTable ? 'Schema & Entity relationships' : 'PostgreSQL DDL Bluprints'}
        </h2>
        <p className="text-[10px] text-slate-505">
          Relational SQL schema mappings optimized for low internet SQLite nodes and remote synchronization cloud targets.
        </p>
      </div>

      {/* Selector tabs between schema viewer and raw DDL */}
      <div className="flex gap-1.5 border-b border-slate-900 pb-2">
        {Object.keys(tables).map(t => (
          <button
            key={t}
            onClick={() => setActiveTable(t)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
              activeTable === t ? 'bg-emerald-950 text-emerald-305 border border-emerald-900/40' : 'bg-slate-900 text-slate-450 hover:bg-slate-850'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
        <button
          onClick={() => { setActiveTable('DDL_RAW'); }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ml-auto ${
            activeTable === 'DDL_RAW' ? 'bg-orange-950 text-orange-305 border border-orange-900/50' : 'bg-slate-900 text-slate-450 hover:bg-slate-850'
          }`}
        >
          View DDL SQL
        </button>
      </div>

      {/* SQL Table schema fields displays */}
      {activeTable !== 'DDL_RAW' ? (
        <div className="space-y-4">
          
          {/* Table node overview container */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3.5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-950 pb-2">
              <span className="font-mono text-emerald-400 font-bold text-sm">TABLE {activeTable}</span>
              <span className="text-[9.5px] text-slate-500 font-bold uppercase">DBMS Blueprint specs</span>
            </div>

            {/* Fields table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-[10px] uppercase font-bold">
                    <th className="pb-2">Field name</th>
                    <th className="pb-2">Type spec</th>
                    <th className="pb-2">Constraint Keys</th>
                    <th className="pb-2">Field details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-950 text-[11px] font-medium text-slate-300">
                  {tables[activeTable as keyof typeof tables].map(f => (
                    <tr key={f.field} className="hover:bg-slate-900/20">
                      <td className="py-2.5 font-mono text-white font-bold">{f.field}</td>
                      <td className="py-2.5 font-mono text-sky-400">{f.type}</td>
                      <td className="py-2.5 font-mono text-amber-500">{f.key}</td>
                      <td className="py-2.5 text-slate-400 leading-relaxed font-sans">{f.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive ERD graphic panel */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10.5px] flex items-center gap-1">
              <Library className="h-3.5 w-3.5 text-slate-500" />
              Dynamic Schema Relations Visualizer
            </h3>

            {/* Draw schema linkages representations */}
            <div className="grid grid-cols-12 gap-3 items-center py-2 text-center text-[10.5px]">
              
              {/* Box products Relation */}
              <div className="col-span-4 p-3 bg-slate-950 border border-slate-900 rounded-lg text-slate-300 space-y-1">
                <span className="font-bold text-emerald-450 block font-mono border-b border-slate-900 pb-1">products</span>
                <span className="font-mono text-[9px] text-slate-500 block">PK: id</span>
                <span className="font-mono text-[9px] text-amber-500 block">FK: supplier_id</span>
              </div>

              {/* Connecting strings */}
              <div className="col-span-4 text-center text-slate-600 font-black relative">
                <div className="border-t border-dashed border-slate-800 absolute w-full top-1/2 -z-10"></div>
                <span className="bg-slate-950 px-2 font-mono text-[9.5px]">supplier_id</span>
              </div>

              {/* Box suppliers */}
              <div className="col-span-4 p-3 bg-slate-950 border border-slate-900 rounded-lg text-slate-300 space-y-1">
                <span className="font-bold text-sky-400 block font-mono border-b border-slate-900 pb-1">suppliers</span>
                <span className="font-mono text-[9px] text-slate-500 block">PK: id</span>
                <span className="font-mono text-[9px] text-slate-300 block">Name, Contact</span>
              </div>

              {/* Row 2 customer and Debts */}
              <div className="col-span-4 p-3 bg-slate-950 border border-slate-900 rounded-lg text-slate-305 space-y-1 mt-2">
                <span className="font-bold text-amber-500 block font-mono border-b border-slate-900 pb-1">debts</span>
                <span className="font-mono text-[9px] text-slate-500 block">PK: id</span>
                <span className="font-mono text-[9px] text-amber-500 block">FK: customer_id</span>
              </div>

              <div className="col-span-4 text-center text-slate-600 font-bold relative mt-2">
                <div className="border-t border-dashed border-slate-800 absolute w-full top-1/2 -z-10"></div>
                <span className="bg-slate-950 px-2 font-mono text-[9.5px]">customer_id</span>
              </div>

              <div className="col-span-4 p-3 bg-slate-950 border border-slate-900 rounded-lg text-slate-300 space-y-1 mt-2">
                <span className="font-bold text-blue-400 block font-mono border-b border-slate-900 pb-1">customers</span>
                <span className="font-mono text-[9px] text-slate-500 block">PK: id</span>
                <span className="font-mono text-[9px] text-slate-300 block">Name, Phone, Bal</span>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* Code view containing full DDL SQL schema scripts */
        <div className="space-y-4">
          <div className="bg-slate-1000 border border-slate-900 rounded-xl p-3 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2 select-none">
              <span className="font-bold text-orange-400 text-xs flex items-center gap-1 font-mono">
                PostgreSQL - Mombasa DB Setup.sql
              </span>
              
              <button 
                id="copy-sql-ddl-btn"
                onClick={copyToClipboard}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-[10.5px] font-bold rounded border border-slate-800 text-orange-355 flex items-center gap-1 cursor-pointer transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Schema'}</span>
              </button>
            </div>

            <pre className="text-[10px] font-mono leading-relaxed text-slate-300 max-h-96 overflow-y-auto overflow-x-auto whitespace-pre p-2 bg-slate-950 rounded-lg">
              {sqlDDL}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
