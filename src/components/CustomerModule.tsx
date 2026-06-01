/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Customer, Sale } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Award, 
  Compass, 
  Check
} from 'lucide-react';

interface CustomerProps {
  customers: Customer[];
  sales: Sale[];
  onAddCustomer: (customerData: any) => Promise<any>;
}

export default function CustomerModule({
  customers,
  sales,
  onAddCustomer
}: CustomerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create profile details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Mombasa Island');
  const [notes, setNotes] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) || 
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    try {
      await onAddCustomer({ name, phone, location, notes });
      setName('');
      setPhone('');
      setNotes('');
      setShowAddForm(false);
    } catch (err) {
      alert("Failed creating customer record.");
    }
  };

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      
      {/* Title block */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
        <div>
          <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-1">
            <Users className="h-4 w-4 text-emerald-400" />
            Customer Registry
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">
            {customers.length} Active Accounts
          </span>
        </div>

        <button 
          id="add-customer-toggle"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-2.5 py-1.5 bg-emerald-950 text-emerald-305 text-[10px] font-bold rounded-lg border border-emerald-900/40 transition flex items-center gap-1 cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>{showAddForm ? 'Close' : 'Add Profile'}</span>
        </button>
      </div>

      {/* Profile Creation Form panel */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest border-b border-slate-950 pb-2">
            Create New Customer profile
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Full Name</label>
              <input 
                id="customer-name-field"
                type="text" 
                placeholder="e.g. Rachel Kadzo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Phone Number</label>
                <input 
                  id="customer-phone-field"
                  type="text" 
                  placeholder="e.g. +254 712 333 444"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Mombasa Area Location</label>
                <select 
                  id="customer-location-field"
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="Mombasa Island">Mombasa Island</option>
                  <option value="Likoni">Likoni</option>
                  <option value="Nyali">Nyali</option>
                  <option value="Bamburi">Bamburi</option>
                  <option value="Mtwapa">Mtwapa</option>
                  <option value="Changamwe">Changamwe</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Customer Notes (Credit limits/Preferences)</label>
              <textarea 
                id="customer-notes-field"
                placeholder="e.g. Promising local hotel owner, buying matoke and watermelons weekly"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white h-16 resize-none focus:outline-none focus:border-emerald-555"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-950">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 font-bold rounded-lg uppercase tracking-wide cursor-pointer"
            >
              Cancel
            </button>
            <button 
              id="submit-customer-btn"
              type="submit" 
              className="px-4 py-2 bg-emerald-600 font-bold text-white rounded-lg uppercase tracking-wide cursor-pointer hover:bg-emerald-555"
            >
              <Check className="h-4 w-4 inline mr-1" />
              Create profile
            </button>
          </div>
        </form>
      )}

      {/* Search box filters */}
      <div className="relative">
        <input 
          id="customer-search"
          type="text" 
          placeholder="Filter customer sheets by name or route..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
      </div>

      {/* Customer registry listing cards */}
      <div className="space-y-2.5">
        {filtered.map(c => (
          <div key={c.id} className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 space-y-2.5">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <span className="text-[10px] bg-slate-950 border border-slate-850 px-1.5 py-0.5 text-slate-400 rounded-md font-bold uppercase">
                  {c.id}
                </span>
                <h4 className="text-sm font-bold text-white pt-1">{c.name}</h4>
                <p className="text-slate-405 font-mono text-[10.5px]">{c.phone}</p>
              </div>

              <div className="flex flex-col items-end gap-1 select-none">
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-350 border border-emerald-900/40 px-2 py-0.5 rounded-full font-bold">
                  <Award className="h-3 w-3" />
                  {c.loyaltyPoints} Pts
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9.5px] text-slate-400 font-semibold">
                  <Compass className="h-3 w-3" />
                  {c.location}
                </span>
              </div>
            </div>

            {/* Outstanding Balance indicators */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-900/50">
              <div className="text-left">
                <span className="text-[9.5px] text-slate-500 uppercase block font-bold">Outstanding Debt</span>
                <span className={`text-sm font-black font-mono leading-none ${
                  c.outstandingBalance > 0 ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  KSh {c.outstandingBalance.toLocaleString()}
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-[9.5px] text-slate-500 uppercase block font-bold">Bills Checked Out</span>
                <span className="text-sm font-black font-mono text-white leading-none">
                  {sales.filter(s => s.paymentDetails?.customerId === c.id || s.paymentMethod === 'CREDIT' && s.paymentDetails?.customerId === c.id).length}
                </span>
              </div>
            </div>

            {c.notes && (
              <p className="text-[10px] text-slate-400 italic bg-slate-950 p-2 rounded border border-slate-900/80">
                “{c.notes}”
              </p>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
