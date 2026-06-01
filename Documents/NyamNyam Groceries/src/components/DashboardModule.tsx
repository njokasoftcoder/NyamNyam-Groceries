/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Sale, Customer, Expense, Debt, StockMovement } from '../types';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Coins, 
  CreditCard, 
  DollarSign, 
  ShoppingBag, 
  Activity
} from 'lucide-react';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  expenses: Expense[];
  debts: Debt[];
  movements: StockMovement[];
  setActiveTab: (val: string) => void;
}

export default function DashboardModule({
  products,
  sales,
  customers,
  expenses,
  debts,
  movements,
  setActiveTab
}: DashboardProps) {

  // Metrics Calculations (Safeguarded for real-time operations)
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySalesList = sales.filter(s => s.timestamp.startsWith(todayStr));
  const todaySalesTotal = todaySalesList.reduce((sum, s) => sum + s.total, 0);

  // Total Stock Valuation (Buy Price * Quantity)
  const totalStockValue = products.reduce((sum, p) => sum + (p.buyingPrice * p.quantity), 0);
  const totalStockRetailValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);

  // Low stock counter
  const lowStockCount = products.filter(p => p.quantity <= p.reorderLevel).length;

  // Debts parameters
  const pendingDebtsTotal = debts.reduce((sum, d) => sum + d.remainingAmount, 0);

  // Mpesa vs Cash ratios
  const todayMpesaCollections = todaySalesList
    .filter(s => s.paymentMethod === 'MPESA')
    .reduce((sum, s) => sum + s.total, 0);

  const todayCashCollections = todaySalesList
    .filter(s => s.paymentMethod === 'CASH')
    .reduce((sum, s) => sum + s.total, 0);

  const todayCreditIssued = todaySalesList
    .filter(s => s.paymentMethod === 'CREDIT')
    .reduce((sum, s) => sum + s.total, 0);

  // Today Profit Calculation: Sum up profit of products sold today
  let todayProfitEstimate = 0;
  todaySalesList.forEach(sale => {
    let saleProfit = 0;
    sale.items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        const itemProfit = (item.unitPrice - p.buyingPrice) * item.quantity;
        saleProfit += itemProfit;
      }
    });
    // subtract proportions of discount
    todayProfitEstimate += (saleProfit - sale.discount);
  });

  // Hot Selling Products
  const productSalesMap: Record<string, { name: string, qty: number, category: string }> = {};
  sales.forEach(s => {
    s.items.forEach(it => {
      if (productSalesMap[it.productId]) {
        productSalesMap[it.productId].qty += it.quantity;
      } else {
        productSalesMap[it.productId] = { name: it.productName, qty: it.quantity, category: "" };
      }
    });
  });

  const bestSellers = Object.entries(productSalesMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);

  // Total expenses today
  const expenseTotalToday = expenses
    .filter(e => e.timestamp.startsWith(todayStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfitEstimated = todayProfitEstimate - expenseTotalToday;

  return (
    <div className="p-4 space-y-4">
      
      {/* Welcome banner and summary info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            NyamNyam - Home Dashboard
          </h1>
          <p className="text-xs text-emerald-400 font-medium">
            Mombasa, Kenya • Digital Records Ledger
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold border border-emerald-900 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
            Active Duty
          </span>
        </div>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Sales Card */}
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Sales</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-slate-400 font-mono">KSh</span>
            <div className="text-lg font-black text-white">{todaySalesTotal.toLocaleString()}</div>
          </div>
          <p className="text-[9px] text-slate-500 mt-1">
            {todaySalesList.length} receipt transactions
          </p>
        </div>

        {/* Profit Card */}
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Est Net Profit</span>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-blue-400">
            <span className="text-xs text-blue-400 font-mono">KSh</span>
            <div className="text-lg font-black text-white">{netProfitEstimated.toLocaleString()}</div>
          </div>
          <p className="text-[9px] text-slate-500 mt-1">
            Valued margin minus expenses
          </p>
        </div>

        {/* Stock Value Card */}
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inventory Value</span>
            <Package className="h-4 w-4 text-orange-400" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-slate-400 font-mono">KSh</span>
            <div className="text-lg font-semibold text-orange-300">{totalStockValue.toLocaleString()}</div>
          </div>
          <span className="text-[9px] text-slate-500 mt-1">
            {products.length} active SKU lines
          </span>
        </div>

        {/* Debts Card */}
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between cursor-pointer hover:border-slate-700/80" onClick={() => setActiveTab('debts')}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Customer Debt</span>
            <Coins className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-rose-300">
            <span className="text-xs text-slate-400 font-mono">KSh</span>
            <div className="text-lg font-black text-rose-300">{pendingDebtsTotal.toLocaleString()}</div>
          </div>
          <span className="text-[9px] text-rose-400 font-bold underline">
            {debts.filter(d => d.status !== 'PAID').length} active credit bills
          </span>
        </div>

      </div>

      {/* Alert Banner for Low Stock */}
      {lowStockCount > 0 && (
        <div 
          onClick={() => setActiveTab('inventory')}
          className="bg-amber-950/40 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-950/60 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 animate-pulse">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-200">
                {lowStockCount} Product Alert limits!
              </div>
              <p className="text-[10px] text-amber-400/85 mt-0.5">
                Tap to stock-in low inventory before stock-out.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-300 underline uppercase">View</span>
        </div>
      )}

      {/* Payment Collections Composition Pie Chart Simulated via visual SVGs */}
      <div className="bg-slate-900/20 p-4 rounded-xl border border-slate-900 space-y-3">
        <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
          Today's Cash Flow Composition
        </h3>

        {todaySalesList.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-medium">
            Waiting for shop checkouts today.
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Custom Interactive SVG Ring Chart */}
            <div className="col-span-5 flex items-center justify-center relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="38" strokeWidth="10" stroke="#1e293b" fill="transparent" />
                {/* Dynamically draw offsets */}
                {(() => {
                  const tot = todayMpesaCollections + todayCashCollections + todayCreditIssued;
                  const mpesaPct = tot > 0 ? (todayMpesaCollections / tot) * 238 : 0;
                  const cashPct = tot > 0 ? (todayCashCollections / tot) * 238 : 0;
                  const creditPct = tot > 0 ? (todayCreditIssued / tot) * 238 : 0;
                  return (
                    <>
                      {/* Cash Part - Green */}
                      <circle 
                        cx="48" cy="48" r="38" strokeWidth="10" 
                        stroke="#10b981" fill="transparent" 
                        strokeDasharray="238" 
                        strokeDashoffset={238 - cashPct} 
                      />
                      {/* MPESA Part - Blue */}
                      <circle 
                        cx="48" cy="48" r="38" strokeWidth="10" 
                        stroke="#0ea5e9" fill="transparent" 
                        strokeDasharray="238" 
                        strokeDashoffset={238 - cashPct - mpesaPct} 
                      />
                      {/* Credit Part - Amber */}
                      <circle 
                        cx="48" cy="48" r="38" strokeWidth="10" 
                        stroke="#f59e0b" fill="transparent" 
                        strokeDasharray="238" 
                        strokeDashoffset={238 - cashPct - mpesaPct - creditPct} 
                      />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 uppercase">Total</span>
                <span className="text-xs font-black text-white">{(todayMpesaCollections + todayCashCollections + todayCreditIssued).toLocaleString()}</span>
              </div>
            </div>

            {/* Legend listings */}
            <div className="col-span-7 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-450">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Cash</span>
                </div>
                <span className="font-mono text-slate-300">KSh {todayCashCollections.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-sky-450">
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  <span>M-Pesa Till</span>
                </div>
                <span className="font-mono text-slate-300">KSh {todayMpesaCollections.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-amber-500">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>Credit Issued</span>
                </div>
                <span className="font-mono text-slate-300">KSh {todayCreditIssued.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Best Selling Products list */}
      <div className="bg-slate-900/20 p-4 rounded-xl border border-slate-900 space-y-2.5">
        <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
          <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
          Best Selling Mombasa Produce
        </h3>
        {bestSellers.length === 0 ? (
          <p className="text-center py-4 text-xs text-slate-500">No grocery items sold yet.</p>
        ) : (
          <div className="space-y-2.5">
            {bestSellers.map(b => (
              <div key={b.id} className="flex items-center justify-between p-2 hover:bg-slate-900/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 text-xs font-bold font-mono">#{b.qty}</span>
                  <span className="text-xs font-medium text-slate-200">{b.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  {products.find(p => p.id === b.id)?.unit || 'units'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent transactions timeline */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            Recent Transactions
          </span>
          <button onClick={() => setActiveTab('api_docs')} className="text-[10px] text-emerald-400 hover:underline">
            View Ledger
          </button>
        </div>

        <div className="space-y-2">
          {sales.slice(-3).reverse().map(s => (
            <div key={s.id} className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-900/80 flex items-center justify-between text-xs transition hover:border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{s.id}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    s.paymentMethod === 'MPESA' ? 'bg-sky-950 text-sky-400' :
                    s.paymentMethod === 'CREDIT' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-350'
                  }`}>
                    {s.paymentMethod}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400">
                  {s.items.length} {s.items.length === 1 ? 'grocery line' : 'grocery lines'} • {s.items.map(it => it.productName.split(' ')[0]).join(', ')}
                </p>
              </div>
              <div className="text-right">
                <div className="font-black text-white text-[12.5px]">KSh {s.total}</div>
                <span className="text-[9px] text-slate-500 block">
                  {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
