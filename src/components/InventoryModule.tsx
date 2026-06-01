/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Supplier } from '../types';
import { 
  Plus, 
  Layers, 
  History, 
  Trash2, 
  Edit, 
  AlertTriangle,
  Phone,
  MapPin,
  Check
} from 'lucide-react';

interface InventoryProps {
  products: Product[];
  suppliers: Supplier[];
  onAddOrUpdateProduct: (product: any) => Promise<any>;
  onDeleteProduct: (id: string) => Promise<any>;
  onAdjustStock: (productId: string, qty: number, type: string, reason: string) => Promise<any>;
  activeRole: string;
}

export default function InventoryModule({
  products,
  suppliers,
  onAddOrUpdateProduct,
  onDeleteProduct,
  onAdjustStock,
  activeRole
}: InventoryProps) {
  const [activeSubTab, setActiveSubTab] = useState<'LIST' | 'ADJUST' | 'FORM' | 'SUPPLIERS'>('LIST');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Stock Adjust form state
  const [adjustProductId, setAdjustProductId] = useState<string>('');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'SPOILAGE' | 'ADJUSTMENT'>('STOCK_IN');
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Product CRUD form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Vegetables');
  const [formBuyingPrice, setFormBuyingPrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formQuantity, setFormQuantity] = useState<number>(0);
  const [formUnit, setFormUnit] = useState<'KG' | 'Piece' | 'Bag' | 'Crate' | 'Bunch'>('KG');
  const [formReorderLevel, setFormReorderLevel] = useState<number>(10);
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  const canEdit = activeRole === 'ADMIN' || activeRole === 'INVENTORY_MANAGER';

  // Toggle Edit Product form
  const handleStartEdit = (prod: Product) => {
    if (!canEdit) return;
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormBuyingPrice(prod.buyingPrice);
    setFormSellingPrice(prod.sellingPrice);
    setFormQuantity(prod.quantity);
    setFormUnit(prod.unit as any);
    setFormReorderLevel(prod.reorderLevel);
    setFormSupplierId(prod.supplierId);
    setFormImageUrl(prod.imageUrl || '');
    setActiveSubTab('FORM');
  };

  const handleStartCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Vegetables');
    setFormBuyingPrice(0);
    setFormSellingPrice(0);
    setFormQuantity(0);
    setFormUnit('KG');
    setFormReorderLevel(10);
    setFormSupplierId(suppliers[0]?.id || '');
    setFormImageUrl('');
    setActiveSubTab('FORM');
  };

  // Submit Product Add/Edit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;
    
    const obj: any = {
      name: formName,
      category: formCategory,
      buyingPrice: Number(formBuyingPrice),
      sellingPrice: Number(formSellingPrice),
      quantity: Number(formQuantity),
      unit: formUnit,
      reorderLevel: Number(formReorderLevel),
      supplierId: formSupplierId,
      imageUrl: formImageUrl || undefined
    };

    if (editingProduct) {
      obj.id = editingProduct.id;
    }

    try {
      await onAddOrUpdateProduct(obj);
      setActiveSubTab('LIST');
    } catch (err) {
      console.error(err);
      alert("Error submitting product updates");
    }
  };

  // Submit Stock Movement adjustment
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId || adjustQty <= 0) return;
    try {
      await onAdjustStock(adjustProductId, adjustQty, adjustType, adjustReason);
      setAdjustProductId('');
      setAdjustQty(0);
      setAdjustReason('');
      setActiveSubTab('LIST');
    } catch (err) {
      console.error(err);
      alert("Error recording warehouse adjustment");
    }
  };

  const totalStockWarehouseValue = products.reduce((sum, p) => sum + (p.buyingPrice * p.quantity), 0);

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      
      {/* Upper sub navigation tags */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
        <div>
          <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-1">
            <Layers className="h-4 w-4 text-emerald-400" />
            Inventory Manager
          </h2>
          <span className="text-[10px] text-slate-550 font-mono text-slate-400">
            Total Warehouse Valuation: KSh {totalStockWarehouseValue.toLocaleString()}
          </span>
        </div>

        {/* Adjust actions inline */}
        <div className="flex gap-1.5">
          <button 
            id="subtab-list"
            onClick={() => setActiveSubTab('LIST')}
            className={`px-2 py-1 rounded text-[10px] font-bold ${
              activeSubTab === 'LIST' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Products
          </button>
          
          <button 
            id="subtab-adjust"
            onClick={() => { setAdjustProductId(products[0]?.id || ''); setActiveSubTab('ADJUST'); }}
            className={`px-2 py-1 rounded text-[10px] font-bold ${
              activeSubTab === 'ADJUST' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Stock Edit
          </button>

          <button 
            id="subtab-suppliers"
            onClick={() => setActiveSubTab('SUPPLIERS')}
            className={`px-2 py-1 rounded text-[10px] font-bold ${
              activeSubTab === 'SUPPLIERS' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Suppliers
          </button>
        </div>
      </div>

      {/* Main product listings tab */}
      {activeSubTab === 'LIST' && (
        <div className="space-y-3">
          
          {/* Quick Create Button */}
          {canEdit && (
            <button 
              id="create-new-product-btn"
              onClick={handleStartCreate}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-555 font-bold text-white rounded-xl flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Category SKU</span>
            </button>
          )}

          {/* Simple table or cards */}
          <div className="space-y-2.5">
            {products.map(p => (
              <div key={p.id} className="bg-slate-900/40 border border-slate-900 p-2.5 rounded-xl flex items-center justify-between hover:border-slate-800 transition">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 bg-slate-950 rounded-lg flex items-center justify-center border border-slate-950 font-bold font-mono text-emerald-400 text-[10px]">
                    {p.unit}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-200">{p.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      Buy: <span className="text-slate-350 font-mono text-slate-300">KSh {p.buyingPrice}</span> • Sell: <span className="text-emerald-400 font-bold font-mono">KSh {p.sellingPrice}</span>
                    </p>
                    <span className="text-[9px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">
                      {p.category}
                    </span>
                  </div>
                </div>

                {/* Status indicators and action list */}
                <div className="text-right space-y-1">
                  <div className="text-sm font-black text-white font-mono">{p.quantity} <span className="text-[9.5px] text-slate-500 font-bold">{p.unit}</span></div>
                  {p.quantity <= p.reorderLevel ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] bg-rose-955/50 border border-rose-900 text-rose-400 rounded-full font-bold animate-pulse">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Low!
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] bg-emerald-950 text-emerald-450 rounded-full font-bold border border-emerald-900/40">
                      Good
                    </span>
                  )}
                  
                  {canEdit && (
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button 
                        onClick={() => handleStartEdit(p)}
                        className="p-1 text-slate-400 hover:text-emerald-400"
                        title="Edit params"
                      >
                        <Edit className="h-3.5 w-3.5 opacity-80" />
                      </button>
                      
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${p.name}?`)) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Delete product"
                      >
                        <Trash2 className="h-3.5 w-3.5 opacity-80" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Stock Adjustment form panel */}
      {activeSubTab === 'ADJUST' && (
        <form onSubmit={handleAdjustSubmit} className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest flex items-center gap-1">
            <History className="h-3.5 w-3.5 text-blue-400" />
            Add Stock Movement Record
          </h3>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Select Produce Unit</label>
            <select
              id="adjust-product-select"
              value={adjustProductId}
              onChange={(e) => setAdjustProductId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white"
            >
              {products.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-950 text-slate-200">
                  {p.name} (Current: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Operation Action</label>
              <select
                id="adjust-type-select"
                value={adjustType}
                onChange={(e: any) => setAdjustType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
              >
                <option value="STOCK_IN">STOCK IN (New Stock)</option>
                <option value="STOCK_OUT">STOCK OUT (Remove items)</option>
                <option value="SPOILAGE">SPOILAGE / WASTAGE (Damaged / Expired)</option>
                <option value="ADJUSTMENT">STOCK ADJUST (Audit Correction)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Quantity</label>
              <input 
                id="adjust-qty-input"
                type="number" 
                placeholder="0"
                value={adjustQty || ''}
                onChange={(e) => setAdjustQty(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Reason / Reference logs</label>
            <textarea 
              id="adjust-reason-field"
              placeholder="e.g. Delivered new stock from Kongowea wholesalers, or Mold spoilage due to rain"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white h-16 resize-none focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => setActiveSubTab('LIST')} 
              className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 font-bold rounded-lg uppercase tracking-wide"
            >
              Cancel
            </button>
            <button 
              id="submit-adjustment-btn"
              type="submit" 
              className="px-4 py-2 bg-emerald-600 font-black text-white rounded-lg uppercase tracking-wide hover:bg-emerald-555 cursor-pointer"
            >
              Save Movement
            </button>
          </div>
        </form>
      )}

      {/* Supplier Directory tab */}
      {activeSubTab === 'SUPPLIERS' && (
        <div className="space-y-3">
          {suppliers.map(s => (
            <div key={s.id} className="bg-slate-900/45 border border-slate-900 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-200 text-xs">{s.name}</h4>
                <span className="text-[9px] bg-emerald-950 text-emerald-355 border border-emerald-900 px-1.5 py-0.5 rounded font-bold uppercase">
                  {s.id}
                </span>
              </div>
              <div className="space-y-1 text-slate-400 text-[11px]">
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-slate-500" />
                  <span>{s.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <span>{s.location}</span>
                </div>
              </div>
              <div className="border-t border-slate-950 pt-2 flex flex-wrap gap-1">
                <span className="text-[9.5px] text-slate-500 font-semibold uppercase block w-full">Supplies:</span>
                {s.productsSupplied.map(pId => {
                  const match = products.find(p => p.id === pId);
                  if (!match) return null;
                  return (
                    <span key={pId} className="px-1.5 py-0.5 bg-slate-950 text-[9px] font-bold text-slate-400 rounded-md border border-slate-900">
                      {match.name.split(' ')[0]}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Add/Edit Product Form tab */}
      {activeSubTab === 'FORM' && (
        <form onSubmit={handleProductSubmit} className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest border-b border-slate-950 pb-2">
            {editingProduct 
              ? `Edit: ${editingProduct.name}`
              : 'Register New Grocery Line'}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Product Name</label>
              <input 
                id="form-product-name"
                type="text" 
                placeholder="e.g. Sukuma Wiki (Collard Greens)"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Category</label>
                <select 
                  id="form-product-category"
                  value={formCategory} 
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Cereals">Cereals</option>
                  <option value="Other">Other Produce</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Produce Unit</label>
                <select 
                  id="form-product-unit"
                  value={formUnit} 
                  onChange={(e: any) => setFormUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="KG">Kilograms (KG)</option>
                  <option value="Piece">Pieces (Pcs)</option>
                  <option value="Bag">Bags (Sacks)</option>
                  <option value="Crate">Crates</option>
                  <option value="Bunch">Bunches</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Buying Price (KSh)</label>
                <input 
                  id="form-product-buy"
                   type="number" 
                  value={formBuyingPrice || ''}
                  onChange={(e) => setFormBuyingPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Selling Price (KSh)</label>
                <input 
                  id="form-product-sell"
                  type="number" 
                  value={formSellingPrice || ''}
                  onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Initial Stock In Quantity</label>
                <input 
                  id="form-product-qty"
                  type="number" 
                  value={formQuantity || ''}
                  onChange={(e) => setFormQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Reorder Level Warn</label>
                <input 
                  id="form-product-reorder"
                  type="number" 
                  value={formReorderLevel || ''}
                  onChange={(e) => setFormReorderLevel(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Supplier Partner</label>
                <select 
                  id="form-product-supplier"
                  value={formSupplierId} 
                  onChange={(e) => setFormSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Photo Image URL (Optional)</label>
              <input 
                id="form-product-image"
                type="text" 
                placeholder="https://images.unsplash.com/..."
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-slate-950 pt-2">
            <button 
              type="button" 
              onClick={() => setActiveSubTab('LIST')} 
              className="px-4 py-2 bg-slate-955 border border-slate-850 text-slate-400 font-bold rounded-lg uppercase tracking-wide cursor-pointer"
            >
              Cancel
            </button>
            <button 
              id="save-form-product-btn"
              type="submit" 
              className="px-4 py-2 bg-emerald-600 font-bold text-white rounded-lg uppercase tracking-wide cursor-pointer hover:bg-emerald-555"
            >
              <Check className="h-4 w-4 inline mr-1" />
              Submit
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
