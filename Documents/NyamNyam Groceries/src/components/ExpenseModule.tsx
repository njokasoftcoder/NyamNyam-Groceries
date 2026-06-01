/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Expense } from '../types';
import { 
  Plus, 
  Activity,
  Calendar,
  Check
} from 'lucide-react';

interface ExpenseProps {
  expenses: Expense[];
  onAddExpense: (expenseData: any) => Promise<any>;
}

export default function ExpenseModule({
  expenses,
  onAddExpense
}: ExpenseProps) {
  const [showForm, setShowForm] = useState(false);
  
  // Create expense details
  const [category, setCategory] = useState<'TRANSPORT' | 'RENT' | 'WAGES' | 'ELECTRICITY' | 'PACKAGING' | 'MARKET_LEVY' | 'OTHER'>('TRANSPORT');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;
    try {
      await onAddExpense({ category, description, amount });
      setDescription('');
      setAmount(0);
      setShowForm(false);
    } catch (err) {
      alert("Error adding expense record.");
    }
  };

  const totalExpensesSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      
      {/* Upper overview card */}
      <div className="bg-slate-900/40 p-4 rounded-xl flex items-center justify-between border border-slate-900">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">
            Accumulated Business Outlays
          </span>
          <h2 id="overall-expenses-count" className="text-xl font-black text-white font-mono mt-1">KSh {totalExpensesSum.toLocaleString()}</h2>
          <span className="text-[9.5px] text-slate-500 font-mono">
            {expenses.length} unique cash outflow rows recorded
          </span>
        </div>

        <button 
          id="add-expense-toggle"
          onClick={() => setShowForm(!showForm)}
          className="px-2.5 py-1.5 bg-emerald-950 text-emerald-305 text-[10px] font-bold rounded-lg border border-emerald-900/40 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{showForm ? 'Close' : 'Add Expense'}</span>
        </button>
      </div>

      {/* Creation form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest border-b border-slate-950 pb-2">
            Record Business Expense
          </h3>

          <div className="space-y-3 font-semibold">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Expense Category</label>
              <select 
                id="expense-category-select"
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
              >
                <option value="TRANSPORT">Transport / Matatu or TukTuk</option>
                <option value="MARKET_LEVY">Kongowea Market Levy / Cess</option>
                <option value="WAGES">Casual Staff Wages</option>
                <option value="RENT">Banda Shop Rent</option>
                <option value="PACKAGING">Packaging plastic / boxes</option>
                <option value="ELECTRICITY">Tokens / Electricity</option>
                <option value="OTHER">Other unexpected outlays</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="text-slate-400 block mb-1 font-semibold">Cost Amount (KSh)</label>
                <input 
                  id="expense-amount-input"
                  type="number" 
                  placeholder="0"
                  value={amount || ''}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Description details</label>
              <textarea 
                id="expense-desc-field"
                placeholder="e.g. fuel, loader daily allowance receipt #90"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white h-16 resize-none focus:outline-none focus:border-emerald-555"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-955">
            <button 
              type="button" 
              onClick={() => setShowForm(false)} 
              className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 font-bold rounded-lg uppercase tracking-wide cursor-pointer"
            >
              Cancel
            </button>
            <button 
              id="submit-expense-btn"
              type="submit" 
              className="px-4 py-2 bg-emerald-600 font-black text-white rounded-lg uppercase tracking-wide cursor-pointer hover:bg-emerald-555"
            >
              <Check className="h-4 w-4 inline mr-1" />
              Save Expense
            </button>
          </div>
        </form>
      )}

      {/* Expenses History lists timeline */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1">
          <Activity className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
          Transactional Expense Ledger
        </h3>

        {expenses.length === 0 ? (
          <p className="text-center py-8 text-slate-500 font-medium">No expenses recorded yet.</p>
        ) : (
          expenses.map(exp => (
            <div key={exp.id} className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex justify-between items-center hover:border-slate-800 transition">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-blue-950 text-blue-400 rounded-md border border-blue-900/40">
                  {exp.category}
                </span>
                <p className="text-xs font-semibold text-slate-200 pt-1 leading-relaxed">
                  {exp.description}
                </p>
                <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-semibold pt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(exp.timestamp).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{new Date(exp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-medium text-slate-500 uppercase block font-bold">Cost</span>
                <span className="text-[13px] font-black text-rose-400 font-mono">KSh {exp.amount.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
