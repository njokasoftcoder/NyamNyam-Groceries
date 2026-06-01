/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Customer } from '../types';
import { 
  Search, 
  Trash2, 
  Minus, 
  Plus, 
  QrCode, 
  Percent, 
  ArrowRight, 
  Check, 
  Share2, 
  User,
  ShoppingBag,
  TrendingDown,
  Coins
} from 'lucide-react';

interface POSProps {
  products: Product[];
  customers: Customer[];
  onAddSale: (saleData: any) => Promise<any>;
  triggerSTKPush: (phone: string, amount: number, saleId?: string) => Promise<any>;
  isOffline: boolean;
}

export default function POSModule({
  products,
  customers,
  onAddSale,
  triggerSTKPush,
  isOffline
}: POSProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Cart state
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  // Checkout flow state
  const [checkoutStep, setCheckoutStep] = useState<'IDLE' | 'PAY_METHOD' | 'PENDING_CONFIRMATION' | 'COMPLETED'>('IDLE');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MPESA' | 'CREDIT'>('CASH');
  
  // Payment sub-details
  const [cashPaid, setCashPaid] = useState<string>('');
  const [mpesaPhone, setMpesaPhone] = useState<string>('');
  const [mpesaManualCode, setMpesaManualCode] = useState<string>('');
  const [stkCheckoutId, setStkCheckoutId] = useState<string>('');
  const [stkStatus, setStkStatus] = useState<string>('');
  const [completedSale, setCompletedSale] = useState<any>(null);

  // Filter Categories
  const categories = ['All', 'Vegetables', 'Fruits', 'Cereals'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat && p.quantity > 0;
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.qty), 0);
  const total = Math.max(0, subtotal - discount);

  // Cart operations
  const addToCart = (product: Product) => {
    const existing = cart.find(it => it.product.id === product.id);
    if (existing) {
      if (existing.qty < product.quantity) {
        setCart(cart.map(it => it.product.id === product.id ? { ...it, qty: it.qty + 1 } : it));
      }
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
  };

  const adjustQty = (prodId: string, delta: number) => {
    const existing = cart.find(it => it.product.id === prodId);
    if (!existing) return;
    const newQty = existing.qty + delta;
    if (newQty <= 0) {
      setCart(cart.filter(it => it.product.id !== prodId));
    } else {
      const prodMax = products.find(p => p.id === prodId)?.quantity || 1;
      if (newQty <= prodMax) {
        setCart(cart.map(it => it.product.id === prodId ? { ...it, qty: newQty } : it));
      }
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setSelectedCustomerId('');
  };

  // Launch simulated STK push or POS finalization
  const handleCheckoutInitiate = async () => {
    if (cart.length === 0) return;
    setCheckoutStep('PAY_METHOD');
    
    // Auto populate custom default customer phone for mpesa 
    if (selectedCustomerId) {
      const cust = customers.find(c => c.id === selectedCustomerId);
      if (cust) {
        setMpesaPhone(cust.phone.replace(/[\s+]/g, ''));
      }
    } else {
      setMpesaPhone('254712345678'); // default simulated line
    }
  };

  // Process POS Checkout Submission
  const processCheckoutComplete = async (overriddenMpesaCode?: string) => {
    const saleItems = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.qty,
      unitPrice: item.product.sellingPrice,
      totalPrice: item.product.sellingPrice * item.qty
    }));

    const finalMpesaCode = overriddenMpesaCode || mpesaManualCode || "CASH_SALE";

    const payload = {
      items: saleItems,
      discount,
      paymentMethod,
      mpesaCode: paymentMethod === 'MPESA' ? finalMpesaCode : undefined,
      customerId: paymentMethod === 'CREDIT' ? selectedCustomerId : (selectedCustomerId || undefined),
      cashPaid: paymentMethod === 'CASH' ? Number(cashPaid || total) : undefined,
      cashierId: "u2",
      cashierName: "Hassan Mwangi"
    };

    try {
      const res = await onAddSale(payload);
      if (res.success) {
        setCompletedSale(res.sale);
        setCheckoutStep('COMPLETED');
        clearCart();
      }
    } catch (e) {
      console.error(e);
      alert("Failed checkout processing");
    }
  };

  // Simulate pushing Daraja STK Request
  const handleTriggerSTK = async () => {
    if (!mpesaPhone.startsWith('254') && !mpesaPhone.startsWith('0')) {
      alert("Please specify a valid Kenyan phone format e.g. 254712...");
      return;
    }
    const cleanPhone = mpesaPhone.startsWith('0') ? '254' + mpesaPhone.slice(1) : mpesaPhone;
    setCheckoutStep('PENDING_CONFIRMATION');
    setStkStatus('STK_PUSH_SENT');

    try {
      const response = await triggerSTKPush(cleanPhone, total);
      if (response.success) {
        setStkCheckoutId(response.checkoutRequestID);
        // Start simulated timer counting down for background Express push callback resolution (4 seconds)
        let seconds = 4;
        const interval = setInterval(() => {
          seconds--;
          if (seconds <= 0) {
            clearInterval(interval);
            setStkStatus('CONFIRMED');
            // Complete the POS record natively
            const fakeCode = "MP_" + Math.random().toString(36).substring(2, 9).toUpperCase();
            processCheckoutComplete(fakeCode);
          }
        }, 1000);
      }
    } catch (err) {
      setStkStatus('FAILED');
      alert("Failed STK Push trigger");
    }
  };

  // Compile WhatsApp link matching Kenya parameters
  const generateWhatsAppShareURI = () => {
    if (!completedSale) return '#';
    const lines = [
      `*NYAMNYAM GROCERIES RECEIPT*`,
      `Mombasa County County, Mombasa Market`,
      `----------------------------------------`,
      `Bill ID: ${completedSale.id}`,
      `Date/Time: ${new Date(completedSale.timestamp).toLocaleDateString()}`,
      `----------------------------------------`,
      ...completedSale.items.map((it: any) => `${it.productName} x ${it.quantity} @${it.unitPrice} = KSh ${it.totalPrice}`),
      `----------------------------------------`,
      `Subtotal: KSh ${completedSale.subtotal}`,
      completedSale.discount > 0 ? `Discount: KSh ${completedSale.discount}` : '',
      `*Total Paid: KSh ${completedSale.total}*`,
      `Payment Method: ${completedSale.paymentMethod}`,
      `----------------------------------------`,
      `Ahsante kwa kununua kwetu! Welcome back.`
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join('\n'));
    
    // Find customer for contact phone info if exists
    let phoneNum = '254700000000';
    if (selectedCustomerId) {
      const cust = customers.find(c => c.id === selectedCustomerId);
      if (cust) phoneNum = cust.phone.replace(/[\s+]/g, '');
    }
    
    return `https://api.whatsapp.com/send?phone=${phoneNum}&text=${text}`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
      
      {checkoutStep === 'IDLE' && (
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Top Quick Produce Filters and Search */}
          <div className="p-3 border-b border-slate-900 bg-slate-950 flex flex-col gap-2 shrink-0 select-none">
            <div className="relative">
              <input 
                id="pos-search-input"
                type="text" 
                placeholder="Search vegetables, bananas, cereals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            </div>

            {/* Scrolling category badges style */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grocery item grids scroll container */}
          <div className="flex-1 overflow-y-auto p-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No matching produce lines in stock.
              </div>
            ) : (
              <div id="pos-grid" className="grid grid-cols-2 gap-2.5">
                {filteredProducts.map(prod => (
                  <div 
                    key={prod.id} 
                    onClick={() => addToCart(prod)}
                    className="bg-slate-900/40 border border-slate-900/80 rounded-xl p-2 cursor-pointer hover:border-emerald-500/20 active:scale-95 transition flex flex-col justify-between"
                  >
                    {prod.imageUrl ? (
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name} 
                        className="w-full h-20 object-cover rounded-lg shrink-0 border border-slate-950" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-16 bg-gradient-to-br from-emerald-950/40 to-slate-900 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 select-none">
                        {prod.unit}
                      </div>
                    )}
                    <div className="mt-1.5">
                      <h4 className="text-xs font-semibold text-slate-250 truncate">{prod.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[12px] font-black text-emerald-450 font-mono">KSh {prod.sellingPrice}</span>
                        <span className={`text-[9px] px-1 rounded font-bold ${
                          prod.quantity <= prod.reorderLevel ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-455'
                        }`}>
                          {prod.quantity} {prod.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Persistent Dynamic Shopping Cart Drawer */}
          <div className="border-t border-slate-900 bg-slate-950 p-3 shrink-0 select-none">
            {cart.length === 0 ? (
              <div id="empty-cart-indicator" className="text-center py-3 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <ShoppingBag className="h-4 w-4" />
                Shopping basket is empty. Select items.
              </div>
            ) : (
              <div className="space-y-3">
                
                {/* Scrollable Cart items lists */}
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-900 pr-1">
                  {cart.map(item => (
                    <div key={item.product.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="max-w-[160px] font-semibold text-slate-205 truncate">
                        {item.product.name}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Adjust quantities */}
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg">
                          <button onClick={() => adjustQty(item.product.id, -1)} className="p-1 hover:text-rose-400">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-[11px] font-black text-white w-5 text-center font-mono">{item.qty}</span>
                          <button onClick={() => adjustQty(item.product.id, 1)} className="p-1 hover:text-emerald-450">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        {/* Cost */}
                        <span className="w-16 text-right font-black text-slate-305 font-mono">
                          KSh {item.product.sellingPrice * item.qty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer select and discount input row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800/85">
                    <label className="text-[9px] text-slate-500 uppercase font-black block">Customer profile</label>
                    <select
                      id="pos-customer-select"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="bg-transparent text-[11px] font-semibold text-slate-200 w-full focus:outline-none focus:ring-0 border-none cursor-pointer p-0"
                    >
                      <option value="" className="bg-slate-950 text-slate-400">-- Walk-in Client --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id} className="bg-slate-950 text-slate-200">
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800/85">
                    <label className="text-[9px] text-slate-500 uppercase font-black block">Discount Limit</label>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">KSh</span>
                      <input 
                        id="pos-discount-input"
                        type="number" 
                        placeholder="0"
                        value={discount || ''}
                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                        className="bg-transparent text-[11px] font-black w-full text-slate-300 p-0 focus:outline-none border-none focus:ring-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Subtotals & Proceed row */}
                <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500">Subtotal</span>
                    <div className="font-bold text-slate-350 font-mono">KSh {subtotal}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Net Cash Total</span>
                    <div className="text-lg font-black text-emerald-450 font-mono">KSh {total}</div>
                  </div>
                </div>

                {/* Action footer triggers checkout */}
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    id="pos-clear-btn"
                    onClick={clearCart}
                    className="py-2.5 bg-slate-900 text-slate-400 border border-slate-800 font-bold text-xs rounded-xl hover:text-rose-450 active:scale-95 transition uppercase tracking-wider"
                  >
                    Clear
                  </button>

                  <button 
                    id="pos-pay-btn"
                    onClick={handleCheckoutInitiate}
                    className="col-span-2 py-2.5 bg-emerald-600 font-black text-xs text-center text-white rounded-xl shadow-lg shadow-emerald-900/15 hover:bg-emerald-555 active:scale-95 transition flex items-center justify-center gap-1 uppercase tracking-wider"
                  >
                    <span>Collect Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* Checkout Method Selection Step */}
      {checkoutStep === 'PAY_METHOD' && (
        <div className="p-4 space-y-4 text-xs select-none">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h3 className="font-bold text-sm text-white">Select Payment Method</h3>
            <span className="font-mono font-bold text-emerald-455">KSh {total.toLocaleString()}</span>
          </div>

          {/* Toggle Choice Blocks */}
          <div className="grid grid-cols-3 gap-2">
            
            {/* Cash Select */}
            <button 
              id="pay-cash-btn"
              onClick={() => { setPaymentMethod('CASH'); }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                paymentMethod === 'CASH' 
                  ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300' 
                  : 'bg-slate-900 border-slate-850 text-slate-400'
              }`}
            >
              <Coins className="h-5 w-5" />
              <span className="font-bold text-[10.5px] tracking-wide">CASH</span>
            </button>

            {/* M-Pesa Select */}
            <button 
              id="pay-mpesa-btn"
              onClick={() => { setPaymentMethod('MPESA'); }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                paymentMethod === 'MPESA' 
                  ? 'bg-sky-950/20 border-sky-500 text-sky-300' 
                  : 'bg-slate-900 border-slate-850 text-slate-400'
              }`}
            >
              <QrCode className="h-5 w-5" />
              <span className="font-bold text-[10.5px] tracking-wide">M-PESA / TILL</span>
            </button>

            {/* Credit Select */}
            <button 
              id="pay-credit-btn"
              disabled={!selectedCustomerId}
              onClick={() => { setPaymentMethod('CREDIT'); }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                !selectedCustomerId ? 'opacity-40 cursor-not-allowed border-slate-950 bg-slate-950/50' :
                paymentMethod === 'CREDIT' 
                  ? 'bg-amber-950/20 border-amber-500 text-amber-300' 
                  : 'bg-slate-900 border-slate-850 text-slate-400'
              }`}
            >
              <TrendingDown className="h-5 w-5" />
              <span className="font-bold text-[10.5px] tracking-wide">CREDIT DEBT</span>
            </button>

          </div>

          {!selectedCustomerId && paymentMethod === 'CREDIT' && (
            <p className="text-amber-400 text-[10px]">
              * You must bind a customer profile to issue credit.
            </p>
          )}

          {/* Conditional Content by payment choice */}
          <div className="bg-slate-900/60 p-4 border border-slate-900 rounded-xl space-y-3">
            
            {paymentMethod === 'CASH' && (
              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 text-[10.5px] font-medium block mb-1">
                    Cash Tendered (Received)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-500">KSh</span>
                    <input 
                      id="cash-received-input"
                      type="number" 
                      placeholder={total.toString()}
                      value={cashPaid}
                      onChange={(e) => setCashPaid(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                {Number(cashPaid) > total && (
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-xs">
                    <span className="text-slate-400 font-medium">Change Returned</span>
                    <span className="font-black text-emerald-400 font-mono text-sm leading-none">
                      KSh {Number(cashPaid) - total}
                    </span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'MPESA' && (
              <div className="space-y-3">
                <div className="bg-emerald-950/25 border border-emerald-900/30 p-2.5 rounded-lg text-[10px] text-emerald-300">
                  📱 Trigger Daraja Express client STK push confirmation.
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-slate-405 text-[10.5px] block mb-1">M-Pesa Customer Mobile</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 254712345678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button 
                    id="trigger-stk-btn"
                    onClick={handleTriggerSTK}
                    className="w-full py-2 bg-emerald-600 font-bold hover:bg-emerald-555 text-white text-xs rounded-lg uppercase tracking-wide cursor-pointer text-center"
                  >
                    🚀 Trigger STK Push
                  </button>
                </div>

                <div className="relative flex py-1.5 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-slate-500 font-bold uppercase">OR MANUAL ENTRY</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div>
                  <label className="text-slate-400 text-[10.5px] block mb-1">Manual M-Pesa Transaction Code</label>
                  <input 
                    id="manual-mpesa-code-field"
                    type="text" 
                    placeholder="e.g. SFT4WXZ78Y"
                    value={mpesaManualCode}
                    onChange={(e) => setMpesaManualCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'CREDIT' && (
              <div className="space-y-2 bg-amber-950/10 p-3 rounded-lg border border-amber-900/20">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                  <User className="h-4 w-4" />
                  <span>{customers.find(c => c.id === selectedCustomerId)?.name}</span>
                </div>
                <p className="text-[10px] text-slate-405">
                  This balance will be added to this client's account as debt, maturing in 14 days.
                </p>
              </div>
            )}

          </div>

          {/* Checkout actions */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              id="back-to-pos-btn"
              onClick={() => { setCheckoutStep('IDLE'); }}
              className="py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 font-semibold text-xs rounded-lg uppercase transition"
            >
              Go Back
            </button>

            {paymentMethod !== 'MPESA' ? (
              <button 
                id="complete-checkout-btn"
                onClick={() => processCheckoutComplete()}
                className="py-2.5 bg-emerald-600 font-black text-xs text-white text-center rounded-lg shadow uppercase transition"
              >
                Complete checkout
              </button>
            ) : (
              <button 
                id="complete-checkout-manual-btn"
                disabled={!mpesaManualCode}
                onClick={() => processCheckoutComplete()}
                className={`py-2.5 font-black text-xs text-center text-white rounded-lg uppercase transition ${
                  mpesaManualCode ? 'bg-emerald-600 hover:bg-emerald-555' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Submit Code
              </button>
            )}
          </div>

        </div>
      )}

      {/* Pending Daraja push loader overlay */}
      {checkoutStep === 'PENDING_CONFIRMATION' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 select-none">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-900 border-t-emerald-450 animate-spin flex items-center justify-center">
            <QrCode className="h-6 w-6 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-center space-y-2 max-w-xs">
            <h4 id="stk-push-message" className="font-bold text-sm text-slate-100 uppercase tracking-widest">Waiting on STK Confirmation</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Push triggered to ${mpesaPhone}. A simplified Safaricom prompt requires M-Pesa PIN validation for KSh {total.toLocaleString()}.
            </p>
            <div className="bg-slate-950 p-2 rounded border border-slate-900 text-[10px] text-orange-400 font-mono">
              Status ID: {stkCheckoutId || 'Initializing...'}
            </div>
            <p className="text-[9.5px] text-slate-500 animate-pulse">
              Simulating Daraja callback. Auto-completes in 4s...
            </p>
          </div>
        </div>
      )}

      {/* Checkout receipt and sharing portal */}
      {checkoutStep === 'COMPLETED' && completedSale && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-none">
          <div className="text-center space-y-1">
            <div className="h-10 w-10 bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-5 w-5" />
            </div>
            <h3 id="receipt-success-banner" className="font-bold text-sm text-white uppercase tracking-wider">Payment Complete</h3>
            <p className="text-[10px] text-slate-450">Receipt #{completedSale.id} added to local server database.</p>
          </div>

          {/* Visual Receipt Body */}
          <div className="bg-white text-slate-900 p-4 rounded-xl border border-slate-200 font-mono space-y-3 shadow-xl">
            <div className="text-center text-[10px] leading-relaxed border-b border-dashed border-slate-350 pb-2">
              <span className="font-sans font-bold text-xs uppercase tracking-wider block">NYAMNYAM GROCERIES</span>
              Mombasa County Market, Mombasa<br />
              Tel: +254 712 345 678<br />
              Date: {new Date(completedSale.timestamp).toLocaleString()}
            </div>

            {/* Receipt list items */}
            <div className="space-y-1.5 text-[10.5px]">
              {completedSale.items.map((it: any) => (
                <div key={it.id} className="flex justify-between font-bold">
                  <span>{it.productName} (x{it.quantity})</span>
                  <span>KSh {it.totalPrice}</span>
                </div>
              ))}
            </div>

            {/* Calculations summaries */}
            <div className="border-t border-dashed border-slate-350 pt-2 space-y-1.5 text-[10.5px] font-bold">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span>KSh {completedSale.subtotal}</span>
              </div>
              {completedSale.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>DISCOUNT</span>
                  <span>-KSh {completedSale.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black border-t border-slate-950 pt-1">
                <span>TOTAL PAID</span>
                <span>KSh {completedSale.total}</span>
              </div>
            </div>

            <div className="text-center text-[9px] border-t border-dashed border-slate-350 pt-2 text-slate-500">
              Payment Method: {completedSale.paymentMethod}<br />
              {completedSale.paymentDetails?.mpesaCode && `M-Pesa Code: ${completedSale.paymentDetails.mpesaCode}\n`}
              Ahsante kwa kununua kwetu! Welcome back.<br />
              *** Digitized by NyamNyam Tech ***
            </div>
          </div>

          {/* Share widgets */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a 
              id="whatsapp-share-btn"
              href={generateWhatsAppShareURI()}
              target="_blank" 
              rel="noopener noreferrer"
              className="py-2.5 bg-emerald-600 hover:bg-emerald-555 font-bold text-white rounded-lg flex items-center justify-center gap-1.5 uppercase transition cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              <span>Share WhatsApp</span>
            </a>

            <button 
              id="new-sale-btn"
              onClick={() => { setCheckoutStep('IDLE'); setCompletedSale(null); }}
              className="py-2.5 bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-850 font-bold rounded-lg uppercase tracking-wide transition cursor-pointer text-center"
            >
              🛒 New Checkout
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
